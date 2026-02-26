import fs from 'fs-extra';
import path from 'path';
import { AudioAnalysisAgent } from '../src/agents/audio-analysis';
import { LyricsSyncAgent } from '../src/agents/lyrics-sync';

// Correct lyrics for "路地裏サーカス"
// Note: Keeping the same text as in the test script for consistency
const CORRECT_LYRICS = `
同じ時間になる I am
正解される解説
満員電車はライン
停止して中で聞こえる
誰かのため息
幸せ的な貴方
答えのない
静止してるみたい
境界線を今日も僕はつなわたり
ようこそ大炎上の路地裏サーカス
`.trim();

async function main() {
    console.log('Starting full synchronization pipeline...');

    // 1. Audio Analysis
    const audioPath = path.join(process.cwd(), 'public', '路地裏サーカス.mp3');
    if (!fs.existsSync(audioPath)) {
        console.error(`Audio file not found at: ${audioPath}`);
        process.exit(1);
    }

    console.log('Running Audio Analysis Agent...');
    const audioAgent = new AudioAnalysisAgent();
    const transriptionResult = await audioAgent.run({
        audioFile: audioPath,
        modelSize: 'medium', // Use medium for better accuracy
        language: 'ja'
    });

    // 2. Lyrics Sync
    console.log('Running Lyrics Sync Agent...');
    const syncAgent = new LyricsSyncAgent();
    // Convert transcription segments to the format expected by sync agent if needed
    // The agents seem compatible based on previous tests
    const syncResult = await syncAgent.run({
        whisperSegments: transriptionResult.segments,
        correctLyrics: CORRECT_LYRICS
    });

    // 3. Transform and Save
    const outputData: { text: string; start: number; end: number; words: any[]; backgroundImage?: string }[] = syncResult.syncedLyrics.map(line => ({
        text: line.text,
        start: line.start,
        end: line.end,
        words: [], // Kinetic typography not yet fully implemented in sync agent
        backgroundImage: undefined // User can set this later
    }));

    // Add sample background to first line for demo preservation
    if (outputData.length > 0) {
        outputData[0].backgroundImage = 'sample_bg.png';
    }

    const outputPath = path.join(process.cwd(), 'src', 'remotion', 'lyrics.json');
    await fs.writeJSON(outputPath, outputData, { spaces: 2 });

    console.log(`Successfully generated lyrics data at: ${outputPath}`);
    console.log('Number of lines synced:', outputData.length);
}

main().catch(console.error);
