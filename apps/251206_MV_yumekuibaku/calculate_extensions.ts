
import * as fs from 'fs';

const subtitles = JSON.parse(fs.readFileSync('./public/final_subtitles.json', 'utf8'));
const fps = 30;

// Filter all Verse 1 items including Pre-Chorus (id_13, id_14) which are grouped together in adjustment schemas
// Based on Root.tsx, IDs 0-10, 1001-1008, 13, 14 allow fadeOut: 50.
// Let's grab all of them.
const verse1Ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1001, 1002, 1003, 1004, 1005, 1006, 13, 14, 1007, 1008];
const verse1Subtitles = subtitles.filter((s: any) => verse1Ids.includes(s.id));

console.log("ID | Text | Extra Frames (Approx) | Seconds");
console.log("---|---|---|---");

verse1Subtitles.forEach((sub: any, index: number) => {
    let extraDuration = 0;
    const nextSub = verse1Subtitles[index + 1];
    const nextNextSub = verse1Subtitles[index + 2];

    if (nextSub) extraDuration += (nextSub.end - nextSub.start);
    if (nextNextSub) extraDuration += (nextNextSub.end - nextNextSub.start);

    // Also there was a fixed buffer of 30 frames in the original code? 
    // Yes: sequenceDuration += 30;
    // but the user's question implies restoring the "Cycle" duration. 
    // The cycle duration effectively kept it alive for this long.

    // Actually, usually endFrame adjustment is relative to the ORIGINAL end.
    // So if we want to extend it to cover the bonus time, we add `extraDuration`.

    const extraFrames = Math.round(extraDuration * fps);

    // Formatting text for display
    const text = sub.text.replace(/\n/g, ' ').substring(0, 15);

    console.log(`${sub.id} | ${text} | ${extraFrames} | ${extraDuration.toFixed(2)}s`);
});
