"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LyricsSyncAgent = void 0;
const text_normalizer_1 = require("../utils/text-normalizer");
const levenshtein = __importStar(require("fast-levenshtein"));
class LyricsSyncAgent {
    constructor() {
        this.normalizer = new text_normalizer_1.TextNormalizer();
    }
    async run(input) {
        console.log('[LyricsSync] Starting synchronization...');
        const correctLines = input.correctLyrics
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        const whisperSegments = input.whisperSegments;
        const syncedLyrics = [];
        const warnings = [];
        // 1. Pre-normalize all lines
        const normalizedCorrect = await Promise.all(correctLines.map(line => this.normalizer.normalize(line)));
        const normalizedWhisper = await Promise.all(whisperSegments.map(seg => this.normalizer.normalize(seg.text)));
        // 2. Matching Logic (Sliding Window / Search)
        let whisperIdx = 0;
        for (let i = 0; i < correctLines.length; i++) {
            const target = normalizedCorrect[i];
            if (target.length === 0)
                continue;
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
                    if (currentCombinedNormalized.length === 0)
                        continue;
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
                syncedLyrics.push({
                    text: correctLines[i],
                    start: whisperSegments[bestMatch.idxStart].start,
                    end: whisperSegments[bestMatch.idxEnd].end,
                    confidence: 1 - (bestMatch.distance / target.length)
                });
                // Move whisperIdx forward
                whisperIdx = bestMatch.idxEnd + 1;
            }
            else {
                warnings.push({
                    type: 'missing',
                    text: `Could not find timing for line: "${correctLines[i]}"`,
                    lineIndex: i
                });
            }
        }
        return {
            syncedLyrics,
            warnings
        };
    }
}
exports.LyricsSyncAgent = LyricsSyncAgent;
