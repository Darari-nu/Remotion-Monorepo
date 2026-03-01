import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    spring,
    useCurrentFrame,
    useVideoConfig,
    random,
    interpolate,
} from 'remotion';
import { z } from 'zod';
import { SubtitleItem } from './utils/srtParser';

// --- Props Definition ---
// Define Zod schema for SubtitleItem
const subtitleItemSchema = z.object({
    id: z.number(),
    startTime: z.number(),
    endTime: z.number(),
    text: z.string(),
});

export const kineticLyricEngineSchema = z.object({
    subtitles: z.array(subtitleItemSchema).optional().describe('SRTデータ (各字幕アイテム)'),
    text: z.string().optional().describe('フォールバック用テキスト (SRTがない場合)'),
    seed: z.number().optional().describe('ランダムシード'),
    bpm: z.number().optional().describe('BPM (テキストモード時の速度)'),

    // Visual Props
    baseFontSize: z.number().optional().describe('基準フォントサイズ (px)'),
    kanjiScale: z.number().optional().describe('漢字の拡大率'),
    hiraganaScale: z.number().optional().describe('ひらがなの拡大率'),
});

export type KineticLyricEngineProps = z.infer<typeof kineticLyricEngineSchema>;

// --- Constants & Helpers ---
const FONT_FAMILY = '"Shippori Mincho", serif';

// Character types for semantic scaling
const getCharType = (char: string) => {
    if (/[\u4E00-\u9FFF]/.test(char)) return 'kanji';
    if (/[\u30A0-\u30FF]/.test(char)) return 'katakana';
    return 'other';
};

const getCharStyle = (char: string, kScale: number, hScale: number) => {
    const type = getCharType(char);
    switch (type) {
        case 'kanji':
            return { scale: kScale, weight: 900 };
        case 'katakana':
            return { scale: hScale, weight: 700 };
        default:
            // "Ne" logic: Check specific characters for extra boost?
            // Actually, handle "Ne" in the layout/render loop for specific override
            return { scale: hScale * 0.9, weight: 700 }; // Boosted valid hiragana/other
    }
};

// Random helper
const seededRandom = (seed: number) => random(seed);

// --- Layout Engine ---
type CharLayout = {
    char: string;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    weight: number;
    isNewLine: boolean;
    startTime?: number; // Added for SRT sync
    endTime?: number;   // Added for SRT sync
    isIntro?: boolean; // Flag for "Ne"
};

const calculateLayout = (
    items: (SubtitleItem | string)[],
    seed: number,
    isSrt: boolean,
    kScale: number,
    hScale: number
): { layout: CharLayout[]; totalHeight: number } => {
    const layout: CharLayout[] = [];

    let currentX = 0;
    let currentY = 0;
    let charCountSinceReset = 0;

    // Config constants
    const BASE_Y_STEP = 200; // Increased spacing for larger font
    const JITTER_X = 40;
    const RESET_X_OFFSET = -250;
    const RESET_Y_RANGE = 450;

    items.forEach((item, i) => {
        const char = isSrt ? (item as SubtitleItem).text : (item as string);
        const startTime = isSrt ? (item as SubtitleItem).startTime : undefined;
        const endTime = isSrt ? (item as SubtitleItem).endTime : undefined;

        // Detect "Ne" (ね, え) at the start
        // Simple heuristic: if it's one of the first few chars and matches
        const isIntro = (i < 2 && (char.includes('ね') || char.includes('え')));

        const charSeed = seed + i * 123.45;
        // Check first char of text for style
        const style = getCharStyle(char[0] || '', kScale, hScale);

        const isExplicitNewline = char === '\n';
        const resetThreshold = 5 + Math.floor(seededRandom(charSeed) * 4);
        const isAutoReset = charCountSinceReset >= resetThreshold;

        // If SRT mode, maybe we strictly follow the stream and just auto-layout?
        // Let's keep the random layout logic for visual interest.
        const isReset = isExplicitNewline || isAutoReset;

        if (isReset) {
            currentX += RESET_X_OFFSET;
            currentY += BASE_Y_STEP + (seededRandom(charSeed + 1) * RESET_Y_RANGE);
            charCountSinceReset = 0;
        } else {
            currentY += BASE_Y_STEP;
            currentX += (seededRandom(charSeed + 2) - 0.5) * 2 * JITTER_X;
            charCountSinceReset++;
        }

        const rotation = (seededRandom(charSeed + 3) - 0.5) * 20;

        let finalScale = style.scale;

        // Random scaling nuance
        if (getCharType(char[0] || '') === 'kanji') {
            finalScale = kScale * (0.9 + seededRandom(charSeed + 4) * 0.2);
        }

        // Special override for Intro "Ne"
        if (isIntro) {
            finalScale = finalScale * 3.0; // BAM! Big size
        }

        layout.push({
            char,
            x: currentX,
            y: currentY,
            rotation,
            scale: finalScale,
            weight: style.weight,
            isNewLine: isReset,
            startTime,
            endTime,
            isIntro,
        });
    });

    return { layout, totalHeight: currentY };
};

// --- Background Noise Component ---
const BackgroundNoise: React.FC<{ width: number; height: number; seed: number }> = ({
    width,
    height,
    seed,
}) => {
    const elements = useMemo(() => {
        return new Array(20).fill(0).map((_, i) => {
            const elSeed = seed + i * 99.9;
            const isLine = seededRandom(elSeed) > 0.5;
            const w = isLine ? width * (0.2 + seededRandom(elSeed + 1) * 0.8) : 50 + seededRandom(elSeed + 1) * 200;
            const h = isLine ? 2 + seededRandom(elSeed + 2) * 5 : 50 + seededRandom(elSeed + 2) * 200;
            const x = (seededRandom(elSeed + 3) - 0.5) * width * 2;
            const y = (seededRandom(elSeed + 4) - 0.5) * height * 2;
            const rotation = seededRandom(elSeed + 5) * 360;

            return { isLine, w, h, x, y, rotation };
        });
    }, [width, height, seed]);

    return (
        <AbsoluteFill style={{ zIndex: 0 }}>
            {elements.map((el, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: el.w,
                        height: el.h,
                        backgroundColor: '#000',
                        transform: `translate(${el.x}px, ${el.y}px) rotate(${el.rotation}deg)`,
                        opacity: 0.05 + seededRandom(seed + i) * 0.1,
                    }}
                />
            ))}
        </AbsoluteFill>
    );
};

// --- Main Component ---
export const KineticLyricEngine: React.FC<KineticLyricEngineProps & { isTransparent?: boolean }> = ({
    subtitles,
    text,
    seed = 1,
    bpm = 120,
    baseFontSize = 80,
    kanjiScale = 3.0,
    hiraganaScale = 1.5,
    isTransparent = false,
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const currentTime = frame / fps;

    // 1. Layout Calculation
    const { layout } = useMemo(() => {
        if (subtitles && subtitles.length > 0) {
            return calculateLayout(subtitles, seed, true, kanjiScale, hiraganaScale);
        } else if (text) {
            const chars = Array.from(text);
            return calculateLayout(chars, seed, false, kanjiScale, hiraganaScale);
        }
        return { layout: [], totalHeight: 0 };
    }, [subtitles, text, seed, kanjiScale, hiraganaScale]);

    // 2. Timing Logic
    let activeIndex = 0;

    if (subtitles && subtitles.length > 0) {
        // Find the last subtitle that has started
        const index = subtitles.findIndex(s => s.startTime > currentTime);
        if (index === -1) {
            // All started, check if song is over
            activeIndex = subtitles.length - 1;
        } else {
            // index is the first one that HASN'T started yet, so active is index - 1
            activeIndex = Math.max(0, index - 1);
        }
        // If before first subtitle, activeIndex should be 0 (prepare)? Or -1?
        if (currentTime < subtitles[0].startTime) {
            activeIndex = 0;
        }
    } else {
        // BPM fallback
        const framesPerBeat = (60 * fps) / bpm;
        activeIndex = Math.floor(frame / framesPerBeat);
    }

    const clampedIndex = Math.min(Math.max(0, activeIndex), layout.length - 1);

    // 3. Camera Logic
    // REMOVED early return to prevent "Rendered more hooks" error
    // if (layout.length === 0) return null;

    const springConfig = {
        damping: 15,
        stiffness: 200,
        mass: 1,
    };

    // Safe fallback if layout is empty
    const targetChar = layout[clampedIndex] || { x: 0, y: 0 };

    const cameraX = spring({
        frame,
        fps,
        config: springConfig,
        to: -targetChar.x,
    });

    const cameraY = spring({
        frame,
        fps,
        config: springConfig,
        to: -targetChar.y,
    });

    // Camera Rotation
    const rotationState = useMemo(() => {
        if (layout.length === 0) return [];
        let rotation = 0;
        const rotations = layout.map((char) => {
            if (char.isNewLine) {
                rotation += (seededRandom(seed + char.x) > 0.5 ? 90 : -90);
            }
            return rotation;
        });
        return rotations;
    }, [layout, seed]);

    const targetRotation = rotationState[clampedIndex] || 0;

    const cameraRotation = spring({
        frame,
        fps,
        config: { damping: 20, stiffness: 100 },
        to: targetRotation,
    });

    // 4. Render
    if (layout.length === 0) return null;

    return (
        <AbsoluteFill style={{ backgroundColor: isTransparent ? 'transparent' : '#ffffff', overflow: 'hidden' }}>
            {/* Google Font Loader */}
            <link
                href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;700;900&display=swap"
                rel="stylesheet"
            />

            {/* Background Noise with random placement per seed - Hide if transparent */}
            {!isTransparent && <BackgroundNoise width={width} height={height} seed={seed} />}

            {/* World Container */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `
            rotate(${cameraRotation}deg)
            translate(${cameraX}px, ${cameraY}px)
          `,
                    transformOrigin: 'center center',
                    willChange: 'transform',
                }}
            >
                {layout.map((charData, i) => {
                    // Pre-loading optimization
                    const isFuture = i > activeIndex + 5;
                    if (isFuture) return null;

                    // Intro Detection
                    const isIntro = charData.isIntro;

                    // Fade Out Logic for Intro
                    let opacity = 1;
                    if (isIntro && charData.endTime) {
                        // Fade out over 0.5s after endTime
                        const fadeDuration = 0.5;
                        const fadeStart = charData.endTime;
                        opacity = interpolate(
                            currentTime,
                            [fadeStart, fadeStart + fadeDuration],
                            [1, 0],
                            { extrapolateRight: 'clamp' }
                        );
                    } else if (isTransparent && !isIntro) {
                        // Standard opacity logic for rest?
                        // "And others don't fade out" -> Keep opacity 1
                        // But wait! If opacity is 1, they stack on screen.
                        // User said: "Unlike others, ONLY THIS ONE fades out".
                        // Logic implies characters normally stay visible.
                    }

                    // For transparent mode, we handle color and shadow.
                    const textColor = isTransparent ? '#ffffff' : '#000000';
                    const textShadow = isTransparent ? '0 4px 10px rgba(0,0,0,0.5)' : 'none';

                    // Intro extra pop animation
                    let scaleMultiplier = 1;
                    if (isIntro && charData.startTime) {
                        const timeSinceStart = (currentTime - charData.startTime) * fps;

                        // Strict visibility check: Hide if before start time
                        if (timeSinceStart < 0) {
                            return null;
                        }

                        // "Pan!" effect: Slam from 1.5x down to 1x quickly
                        scaleMultiplier = spring({
                            frame: timeSinceStart,
                            fps,
                            config: { damping: 15, stiffness: 300, mass: 0.5 },
                            from: 1.5,
                            to: 1
                        });
                    }

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: charData.x,
                                top: charData.y,
                                transform: `
                  translate(-50%, -50%) 
                  scale(${charData.scale * scaleMultiplier}) 
                  rotate(${charData.rotation}deg)
                `,
                                fontFamily: FONT_FAMILY,
                                fontWeight: charData.weight,
                                fontSize: `${baseFontSize}px`,
                                color: textColor,
                                whiteSpace: 'pre',
                                textAlign: 'center',
                                lineHeight: 1,
                                textShadow: textShadow,
                                opacity: opacity,
                            }}
                        >
                            {charData.char}
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};
