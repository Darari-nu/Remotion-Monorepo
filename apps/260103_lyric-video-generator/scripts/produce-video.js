"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const bundler_1 = require("@remotion/bundler");
const renderer_1 = require("@remotion/renderer");
const audio_analysis_1 = require("../src/agents/audio-analysis");
const lyrics_sync_1 = require("../src/agents/lyrics-sync");
const audit_1 = require("../src/agents/audit");
const image_scanner_1 = require("../src/utils/image-scanner");
// Configuration
const CONFIG = {
    audioFile: '路地裏サーカス.m4a',
    audioPath: path_1.default.join(process.cwd(), 'public', '路地裏サーカス.m4a'),
    lyricsPath: path_1.default.join(process.cwd(), 'public', 'lyrics.txt'),
    outputPath: path_1.default.join(process.cwd(), 'out', 'video.mp4'),
    compositionId: 'LyricVideo',
    entryPoint: path_1.default.join(process.cwd(), 'src', 'remotion', 'index.ts'),
    lyricsJsonPath: path_1.default.join(process.cwd(), 'src', 'remotion', 'lyrics.json'),
};
async function main() {
    console.log('🎬 Starting Video Production Pipeline...');
    // --- Step 0: Load Assets ---
    if (!fs_extra_1.default.existsSync(CONFIG.lyricsPath)) {
        throw new Error(`Lyrics file not found: ${CONFIG.lyricsPath}`);
    }
    const CORRECT_LYRICS = fs_extra_1.default.readFileSync(CONFIG.lyricsPath, 'utf-8').trim();
    console.log(`✅ Loaded lyrics from ${CONFIG.lyricsPath}`);
    const bgImages = await (0, image_scanner_1.getAvailableImages)();
    console.log(`✅ Found ${bgImages.length} images in public/images`);
    // --- Step 1: Audio Analysis ---
    console.log('\n[1/5] 🎤 Running Audio Analysis...');
    if (!fs_extra_1.default.existsSync(CONFIG.audioPath)) {
        throw new Error(`Audio file not found: ${CONFIG.audioPath}`);
    }
    const audioAgent = new audio_analysis_1.AudioAnalysisAgent();
    // Assuming python env is set up
    const transcription = await audioAgent.run({
        audioFile: CONFIG.audioPath,
        modelSize: 'medium',
        language: 'ja'
    });
    console.log(`✅ Transcription complete. ${transcription.segments.length} segments found.`);
    // --- Step 2: Lyrics Sync ---
    console.log('\n[2/5] 🔄 Synchronizing Lyrics...');
    const syncAgent = new lyrics_sync_1.LyricsSyncAgent();
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
            words: [],
            backgroundImage: bgImage
        };
    });
    // --- Step 3: Audit ---
    console.log('\n[3/5] 🛡️ Auditing Data...');
    const auditAgent = new audit_1.AuditAgent();
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
    await fs_extra_1.default.writeJSON(CONFIG.lyricsJsonPath, finalLyricsData, { spaces: 2 });
    console.log('✅ lyrics.json updated.');
    // --- Step 5: Render ---
    console.log('\n[5/5] 🎥 Rendering Video...');
    // 5a. Bundle
    console.log('   Bundling Remotion Composition...');
    const bundleLocation = await (0, bundler_1.bundle)({
        entryPoint: CONFIG.entryPoint,
        // If you need to pass Webpack config override, do it here
    });
    // 5b. Select Composition (to get dimensions/duration)
    const composition = await (0, renderer_1.selectComposition)({
        serveUrl: bundleLocation,
        id: CONFIG.compositionId,
        inputProps: {
            audioSrc: CONFIG.audioFile,
            lyrics: finalLyricsData,
        },
    });
    // 5c. Render
    console.log(`   Rendering to ${CONFIG.outputPath}...`);
    await (0, renderer_1.renderMedia)({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: CONFIG.outputPath,
        inputProps: {
            audioSrc: CONFIG.audioFile,
            lyrics: finalLyricsData,
        }
    });
    console.log('\n🎉 Video production complete!');
    console.log(`Output: ${CONFIG.outputPath}`);
}
main().catch(err => {
    console.error('❌ Pipeline failed:', err);
    process.exit(1);
});
