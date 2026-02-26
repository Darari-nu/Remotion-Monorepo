import { TextNormalizer } from '../utils/text-normalizer';
import * as levenshtein from 'fast-levenshtein';
import { Segment } from './audio-analysis';

export interface LyricsSyncInput {
    whisperSegments: Segment[];
    correctLyrics: string;
}

export interface SyncWarning {
    type: 'mismatch' | 'missing' | 'timing_issue';
    text: string;
    lineIndex?: number;
}

export interface SyncedLyricLine {
    text: string;
    start: number;
    end: number;
    confidence: number;
    words?: { word: string; start: number; end: number; probability: number }[]; // Added words
}

export interface LyricsSyncOutput {
    syncedLyrics: SyncedLyricLine[];
    warnings: SyncWarning[];
}

export class LyricsSyncAgent {
    private normalizer: TextNormalizer;

    constructor() {
        this.normalizer = new TextNormalizer();
    }

    async run(input: LyricsSyncInput): Promise<LyricsSyncOutput> {
        console.log('[LyricsSync] Starting synchronization...');

        const correctLines = input.correctLyrics
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const whisperSegments = input.whisperSegments;
        const syncedLyrics: SyncedLyricLine[] = [];
        const warnings: SyncWarning[] = [];

        // 1. Pre-normalize all lines
        const normalizedCorrect = await Promise.all(
            correctLines.map(line => this.normalizer.normalize(line))
        );
        const normalizedWhisper = await Promise.all(
            whisperSegments.map(seg => this.normalizer.normalize(seg.text))
        );

        // 2. Matching Logic (Sliding Window / Search)
        let whisperIdx = 0;

        for (let i = 0; i < correctLines.length; i++) {
            const target = normalizedCorrect[i];
            if (target.length === 0) continue;

            let bestMatch = {
                distance: Infinity,
                idxStart: -1,
                idxEnd: -1,
            };

            // Search for the best match starting from current whisperIdx
            // We allow skipping up to 5 whisper segments to find a match
            for (let skip = 0; skip < 5 && (whisperIdx + skip) < whisperSegments.length; skip++) {
                let currentCombinedNormalized = '';

                // Try combining up to 4 segments for a single lyric line
                for (let len = 0; len < 4 && (whisperIdx + skip + len) < whisperSegments.length; len++) {
                    currentCombinedNormalized += normalizedWhisper[whisperIdx + skip + len];

                    if (currentCombinedNormalized.length === 0) continue;

                    const distance = levenshtein.get(target, currentCombinedNormalized);
                    const ratio = distance / Math.max(target.length, currentCombinedNormalized.length);

                    if (ratio < 0.5 && distance < bestMatch.distance) {
                        bestMatch = {
                            distance: distance,
                            idxStart: whisperIdx + skip,
                            idxEnd: whisperIdx + skip + len
                        };
                    }
                }
            }

            if (bestMatch.idxStart !== -1) {
                // Collect words from all matched segments
                const words = [];
                for (let k = bestMatch.idxStart; k <= bestMatch.idxEnd; k++) {
                    const seg = whisperSegments[k];
                    console.log(`[DEBUG] Segment ${k} words:`, JSON.stringify(seg.words));
                    if (seg.words && seg.words.length > 0) {
                        words.push(...seg.words);
                    }
                }

                syncedLyrics.push({
                    text: correctLines[i],
                    start: whisperSegments[bestMatch.idxStart].start,
                    end: whisperSegments[bestMatch.idxEnd].end,
                    confidence: 1 - (bestMatch.distance / target.length),
                    words: words // Pass the collected words
                });
                // Move whisperIdx forward
                whisperIdx = bestMatch.idxEnd + 1;
            } else {
                warnings.push({
                    type: 'missing',
                    text: `Could not find timing for line: "${correctLines[i]}"`,
                    lineIndex: i
                });
            }
        }

        return {
            syncedLyrics: syncedLyrics.map(line => ({
                ...line,
                text: this.formatLine(line.text)
            })),
            warnings
        };
    }

    private formatLine(text: string): string {
        // Simple heuristic for intelligent line breaks
        // If line is long (> 15 chars), try to break at space or punctuation
        const MAX_LEN = 15;
        if (text.length <= MAX_LEN) return text;

        // Check for existing spaces
        if (text.includes(' ') || text.includes('　')) {
            return text.replace(/([ 　]+)/g, '\n').trim();
        }

        // Check for punctuation
        if (text.includes('、') || text.includes('。') || text.includes('！') || text.includes('？')) {
            return text.replace(/([、。！？])/g, '$1\n').trim();
        }

        // Fallback: split at midpoint if very long
        if (text.length > 20) {
            const mid = Math.floor(text.length / 2);
            return text.slice(0, mid) + '\n' + text.slice(mid);
        }

        return text;
    }
}
