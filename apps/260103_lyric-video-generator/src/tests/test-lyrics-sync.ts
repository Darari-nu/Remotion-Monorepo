import fs from 'fs-extra';
import path from 'path';
import { LyricsSyncAgent } from '../agents/lyrics-sync';

async function main() {
    const whisperDataPath = path.join(process.cwd(), 'temp', 'transcription_test.json');

    if (!fs.existsSync(whisperDataPath)) {
        console.error('Whisper data not found. Please run Phase 2 first.');
        return;
    }

    const whisperData = await fs.readJSON(whisperDataPath);

    // These are sample lyrics for "路地裏サーカス" (Street Circus)
    // Based on the transcription results
    const correctLyrics = `
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

    const agent = new LyricsSyncAgent();
    const result = await agent.run({
        whisperSegments: whisperData.segments,
        correctLyrics: correctLyrics
    });

    console.log('\n--- Sync Results ---');
    result.syncedLyrics.forEach((line, i) => {
        console.log(`[Line ${i + 1}] ${line.text} (${line.start.toFixed(2)}s - ${line.end.toFixed(2)}s) Conf: ${line.confidence.toFixed(2)}`);
    });

    if (result.warnings.length > 0) {
        console.log('\n--- Warnings ---');
        result.warnings.forEach(w => console.warn(`[${w.type}] ${w.text}`));
    }
}

main().catch(console.error);
