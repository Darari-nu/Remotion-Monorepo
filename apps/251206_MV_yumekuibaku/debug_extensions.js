
const fs = require('fs');

const subtitles = JSON.parse(fs.readFileSync('./public/final_subtitles.json', 'utf8'));
const fps = 30;

console.log(`Loaded ${subtitles.length} subtitles.`);

// Re-create the EXACT filtering used in StandardSubtitleCompositionV7
const verse1Subtitles = subtitles.filter(s => s.section === 'verse1');

console.log(`Filtered ${verse1Subtitles.length} Verse1 subtitles.`);
if (verse1Subtitles.length > 0) {
    console.log(`First item: ID=${verse1Subtitles[0].id}, Section=${verse1Subtitles[0].section}`);
} else {
    // Debug why filter failed
    const sample = subtitles.find(s => s.id === 0);
    if (sample) console.log(`Sample ID 0: Section='${sample.section}'`);
}

console.log("ID | Text | Next(Dur) | NextNext(Dur) | Total Extra (s) | Total Extra (F)");
console.log("---|---|---|---|---|---");

verse1Subtitles.forEach((sub, index) => {
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
