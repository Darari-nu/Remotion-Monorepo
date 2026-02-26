import fs from 'fs-extra';
import path from 'path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { AudioAnalysisAgent } from '../src/agents/audio-analysis';
import { LyricsSyncAgent } from '../src/agents/lyrics-sync';
import { AuditAgent } from '../src/agents/audit';
import { getAvailableImages } from '../src/utils/image-scanner';
import lyricsDataTemplate from '../src/remotion/lyrics.json'; // Type inference helper if needed

// Configuration
const CONFIG = {
    audioFile: '路地裏サーカス.m4a',
    audioPath: path.join(process.cwd(), 'public', '路地裏サーカス.m4a'),
    lyricsPath: path.join(process.cwd(), 'public', 'lyrics.txt'),
    outputPath: path.join(process.cwd(), 'out', 'video.mp4'),
    compositionId: 'LyricVideo',
    entryPoint: path.join(process.cwd(), 'src', 'remotion', 'index.ts'),
    lyricsJsonPath: path.join(process.cwd(), 'src', 'remotion', 'lyrics.json'),
};

async function main() {
    console.log('🎬 Starting Video Production Pipeline...');

    // --- Step 0: Load Assets ---
    if (!fs.existsSync(CONFIG.lyricsPath)) {
        throw new Error(`Lyrics file not found: ${CONFIG.lyricsPath}`);
    }
    const CORRECT_LYRICS = fs.readFileSync(CONFIG.lyricsPath, 'utf-8').trim();
    console.log(`✅ Loaded lyrics from ${CONFIG.lyricsPath}`);

    const bgImages = await getAvailableImages();
    console.log(`✅ Found ${bgImages.length} images in public/images`);

    // --- Step 1: Audio Analysis ---
    console.log('\n[1/5] 🎤 Running Audio Analysis...');
    if (!fs.existsSync(CONFIG.audioPath)) {
        throw new Error(`Audio file not found: ${CONFIG.audioPath}`);
    }
    const audioAgent = new AudioAnalysisAgent();
    // Assuming python env is set up
    const transcription = await audioAgent.run({
        audioFile: CONFIG.audioPath,
        modelSize: 'medium',
        language: 'ja'
    });
    console.log(`✅ Transcription complete. ${transcription.segments.length} segments found.`);
    if (transcription.segments.length > 0) {
        console.log(`[DEBUG MAIN] First seg words:`, JSON.stringify(transcription.segments[0].words));
    }

    // --- Step 2: Lyrics Sync ---
    console.log('\n[2/5] 🔄 Synchronizing Lyrics...');
    const syncAgent = new LyricsSyncAgent();
    const syncResult = await syncAgent.run({
        whisperSegments: transcription.segments,
        correctLyrics: CORRECT_LYRICS
    });
    console.log(`✅ Sync complete. ${syncResult.syncedLyrics.length} lines matched.`);

    // Prepare data for saving with Auto Image Cycling
    const finalLyricsData = syncResult.syncedLyrics.map((line, index) => {
        let bgImage = undefined;
        if (bgImages.length > 0) {
            // Cycle: line 0 -> img 0, line 1 -> img 1...
            const imgIndex = index % bgImages.length;
            bgImage = bgImages[imgIndex];
        }

        return {
            text: line.text,
            start: line.start,
            end: line.end,
            words: line.words || [], // Pass the words
            backgroundImage: bgImage
        };
    });

    // --- Step 3: Audit ---
    console.log('\n[3/5] 🛡️ Auditing Data...');
    const auditAgent = new AuditAgent();
    // Mock config for audit
    const auditConfig = { style: { fontSize: 80 } };
    // @ts-ignore
    const auditReport = auditAgent.check(finalLyricsData, auditConfig);

    if (!auditReport.isValid) {
        console.error('❌ Audit Failed! Critical errors detected:');
        auditReport.issues.filter(i => i.type === 'error').forEach(i => console.error(`   Line ${i.lineIndex + 1}: ${i.message}`));
        process.exit(1);
    }
    if (auditReport.issues.length > 0) {
        console.warn('⚠️  Audit Warnings (Non-critical):');
        auditReport.issues.forEach(i => console.warn(`   Line ${i.lineIndex + 1}: ${i.message}`));
    }
    console.log('✅ Audit passed.');

    // --- Step 4: Save Data ---
    console.log('\n[4/5] 💾 Saving Lyrics Data...');
    // Debug log to confirm words are present
    const totalWords = finalLyricsData.reduce((acc, line) => acc + (line.words?.length || 0), 0);
    console.log(`   Detailed timing: ${totalWords} words captured.`);

    await fs.writeJSON(CONFIG.lyricsJsonPath, finalLyricsData, { spaces: 2 });
    console.log('✅ lyrics.json updated.');

    // --- Step 5: Render ---
    console.log('\n[5/5] 🎥 Rendering Video...');

    // 5a. Bundle
    console.log('   Bundling Remotion Composition...');
    const bundleLocation = await bundle({
        entryPoint: CONFIG.entryPoint,
        // If you need to pass Webpack config override, do it here
    });

    // 5b. Select Composition (with dynamic duration)
    // Audio duration is in seconds. Local Remotion defaults to 30fps.
    const fps = 30;
    const durationInFrames = Math.ceil(transcription.duration * fps);
    console.log(`⏱️  Setting video duration to ${transcription.duration}s (${durationInFrames} frames)`);

    const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: CONFIG.compositionId,
        inputProps: {
            audioSrc: CONFIG.audioFile,
            lyrics: finalLyricsData,
            // @ts-ignore - Dynamic prop for metadata calculation
            durationInFrames: durationInFrames,
        },
    });

    // 5c. Render
    console.log(`   Rendering to ${CONFIG.outputPath}...`);
    await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: CONFIG.outputPath,
        inputProps: {
            audioSrc: CONFIG.audioFile,
            lyrics: finalLyricsData,
            // @ts-ignore
            durationInFrames: durationInFrames,
        }
    });

    console.log('\n🎉 Video production complete!');
    console.log(`Output: ${CONFIG.outputPath}`);
}

main().catch(err => {
    console.error('❌ Pipeline failed:', err);
    process.exit(1);
});
