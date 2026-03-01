export interface SubtitleItem {
    id: number;
    startTime: number; // in seconds
    endTime: number;   // in seconds
    text: string;
}

const timeToSeconds = (timeString: string): number => {
    const [h, m, s, ms] = timeString.split(/[:,]/).map(Number);
    // SRT format: HH:MM:SS,ms or HH:MM:SS.ms. Regex splits on : and ,
    // Standard SRT uses comma for milliseconds.

    // Note: split result might be [h, m, s] if no ms, or [h,m,s,ms]
    // Let's parse strictly.
    // Format: 00:00:16,200
    const parts = timeString.split(':');
    const secondsParts = parts[2].split(',');

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(secondsParts[0], 10);
    const milliseconds = parseInt(secondsParts[1], 10);

    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};

export const parseSrt = (srtContent: string): SubtitleItem[] => {
    const items: SubtitleItem[] = [];
    // Normalize line endings
    const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalized.trim().split('\n\n');

    blocks.forEach((block) => {
        const lines = block.trim().split('\n');
        if (lines.length < 3) return;

        const id = parseInt(lines[0], 10);
        const timeLine = lines[1];

        // "00:00:16,200 --> 00:00:16,600"
        const [startStr, endStr] = timeLine.split(' --> ');
        if (!startStr || !endStr) return;

        const startTime = timeToSeconds(startStr.trim());
        const endTime = timeToSeconds(endStr.trim());

        // Join remaining lines as text
        const text = lines.slice(2).join('\n');

        items.push({
            id,
            startTime,
            endTime,
            text,
        });
    });

    return items;
};
