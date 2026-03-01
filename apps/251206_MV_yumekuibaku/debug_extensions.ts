
import * as fs from 'fs';

const subtitles = JSON.parse(fs.readFileSync('./public/final_subtitles.json', 'utf8'));
const fps = 30;

// Re-create the EXACT filtering used in StandardSubtitleCompositionV7
// The code uses: const verse1Subtitles = subtitles.filter(s => s.section === 'verse1');
// Does section 'verse1' include 1001 etc?
// YES, line 95: "section": "verse1" for id 1001.

const verse1Subtitles = subtitles.filter((s: any) => s.section === 'verse1');

console.log("ID | Text | Next(Dur) | NextNext(Dur) | Total Extra (s) | Total Extra (F)");
console.log("---|---|---|---|---|---");

verse1Subtitles.forEach((sub: any, index: number) => {
    let extraSeconds = 0;
    const nextSub = verse1Subtitles[index + 1];
    const nextNextSub = verse1Subtitles[index + 2];

    let breakdown = "";

    if (nextSub) {
        const d = nextSub.end - nextSub.start;
        extraSeconds += d;
        breakdown += `Next:${nextSub.id}(${d.toFixed(2)}s) `;
    }
    if (nextNextSub) {
        const d = nextNextSub.end - nextNextSub.start;
        extraSeconds += d;
        breakdown += `NextNext:${nextNextSub.id}(${d.toFixed(2)}s)`;
    }

    const extraFrames = Math.round(extraSeconds * fps);
    const text = sub.text.replace(/\n/g, ' ').substring(0, 10);

    console.log(`${sub.id} | ${text} | ${breakdown} | ${extraSeconds.toFixed(2)}s | ${extraFrames}`);
});
