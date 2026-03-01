import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

// Rename interface if exported, or just keep it local
export interface FloatingSubtitleProps {
    text: string;
    enterFrame: number;
    fontSize?: number;
    color?: string;
    letterSpacing?: string;
    animationSpeed?: number;
    spread?: number;
    stagger?: number;
    kanjiScale?: number;
    kanaScale?: number;
    jitter?: number;
    stiffness?: number; // Spring stiffness (Higher = snappier)
    damping?: number;   // Spring damping (Lower = bouncier, Higher = less bounce)
    lineGap?: number; // Gap between lines in pixels (or em multiplier logic)
    // New Visibility Props
    shadowBlur?: number;
    shadowColor?: string;
    strokeWidth?: number;
    strokeColor?: string;
    durationInFrames?: number; // Needed for exit animation
}

export const FloatingSubtitleV6: React.FC<FloatingSubtitleProps> = ({
    text,
    enterFrame,
    fontSize = 80,
    color = '#ffffff',
    letterSpacing = '0.1em',
    animationSpeed = 15,
    spread = 300,
    stagger = 5,
    kanjiScale = 1.1,
    kanaScale = 0.9,
    jitter = 10,
    stiffness = 200, // Increased default from 100 for snappier feel
    damping = 20,    // Increased from 15 to reduce wobble
    lineGap = 20, // Default gap
    shadowBlur = 10,
    shadowColor = 'rgba(0,0,0,0.8)', // Darker default
    strokeWidth = 0,
    strokeColor = 'rgba(0,0,0,0.5)',
    durationInFrames = 150, // Default fallback
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Helper to detect char type
    const getScale = (char: string) => {
        // Kanji range (simplified)
        const isKanji = /[\u4e00-\u9faf\u3400-\u4dbf]/.test(char);
        // Hiragana/Katakana
        const isKana = /[\u3040-\u309f\u30a0-\u30ff]/.test(char);

        if (isKanji) return kanjiScale;
        if (isKana) return kanaScale;
        return 1.0; // Punctuation, others
    };

    // Geometric Props (Could be exposed later, hardcoded or re-mapped for now)
    const OBLIQUE_ANGLE = -15; // Skew angle in degrees
    const WIPE_COLOR = '#ffffff'; // Color of the wiping shape
    const WIPE_HEIGHT = 60; // Height of the leading wipe block (px)

    // Parse lines
    const lines = text.split('\n');

    // Timing constants
    const EXIT_DURATION = 15;
    const EXIT_OFFSET = 10; // Start exit N frames before end

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                pointerEvents: 'none',
                flexDirection: 'row-reverse', // Vertical writing columns R->L
                gap: `${lineGap}px`,
            }}
        >
            {lines.map((line, lineIndex) => (
                <div
                    key={lineIndex}
                    style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'upright',
                        fontFamily: '"Zen Old Mincho", "Hiragino Mincho ProN", serif',
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: letterSpacing,
                        alignItems: 'center', // Center chars horizontally within the vertical line
                    }}
                >
                    {line.split('').map((char, charIndex) => {
                        const seed = `${text}-${lineIndex}-${charIndex}`;

                        // Calculate global index for this char to ensure correct sequential order
                        // Since we are mapping inside nested loops, we need to count previous chars
                        let globalIndex = 0;
                        for (let l = 0; l < lineIndex; l++) {
                            // Note: lines[l] use lines array access
                            globalIndex += lines[l].length;
                        }
                        globalIndex += charIndex;

                        // Per-Char Stagger
                        const charDelay = globalIndex * stagger;

                        // ----------------------------------------------------
                        // ENTER ANIMATION (Per Char)
                        // ----------------------------------------------------
                        const enterProgress = spring({
                            frame: frame - enterFrame - charDelay,
                            fps,
                            config: {
                                damping: 20,
                                stiffness: 150, // Snappy
                                mass: 0.6, // Lighter for char
                            },
                        });

                        // ----------------------------------------------------
                        // EXIT ANIMATION (Per Char)
                        // ----------------------------------------------------
                        const exitStagger = globalIndex * 2;
                        const exitStart = durationInFrames - EXIT_DURATION - EXIT_OFFSET + exitStagger;

                        const exitProgress = spring({
                            frame: frame - exitStart,
                            fps,
                            config: {
                                damping: 20,
                                stiffness: 150,
                                mass: 0.6,
                            },
                        });

                        // ----------------------------------------------------
                        // MASK & WIPE VALUES
                        // ----------------------------------------------------

                        // ENTER: Reveal from Bottom (inset bottom 100% -> 0%)
                        const enterInsetBottom = interpolate(enterProgress, [0, 1], [100, 0]);
                        const enterWipePos = interpolate(enterProgress, [0, 1], [0, 100]); // Top 0% -> 100%
                        const enterWipeOpacity = interpolate(enterProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

                        // EXIT: Hide from Top (inset top 0% -> 100%)
                        const exitInsetTop = interpolate(exitProgress, [0, 1], [0, 100]);
                        const exitWipePos = interpolate(exitProgress, [0, 1], [0, 100]);
                        const exitWipeOpacity = interpolate(exitProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

                        const currentClipPath = `inset(${exitInsetTop}% 0% ${enterInsetBottom}% 0%)`;

                        // Scale logic (keep kanji scale)
                        const charScale = getScale(char);
                        const finalFontSize = fontSize * charScale;

                        return (
                            <div
                                key={charIndex}
                                style={{
                                    position: 'relative',
                                    fontSize: finalFontSize,
                                    color: color,
                                    textShadow: `0 0 2px ${shadowColor}, 0 0 ${shadowBlur}px ${shadowColor}`,
                                    WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : undefined,
                                    // Margins for Jitter? Or just static gap?
                                    // User removed jitter explicitly in V5 plan for "Geometric" feel?
                                    // Let's keep `jitter` prop usage if we want, but grid-like is better for geometric.
                                    // We will use just a small margin to compensate random pos.
                                    display: 'inline-block',
                                    margin: '0',
                                    padding: '5px', // Padding for wipe overspill

                                    // CLIP PATH ON CONTAINER
                                    clipPath: currentClipPath,
                                }}
                            >
                                {/* The Character */}
                                <span style={{ display: 'inline-block' }}>{char}</span>

                                {/* ENTER Wipe Shape */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: `${enterWipePos}%`,
                                        left: '-50%',
                                        width: '200%',
                                        height: `${WIPE_HEIGHT}px`, // Needs to cover the char height at least roughly
                                        background: WIPE_COLOR,
                                        opacity: enterWipeOpacity,
                                        transform: `translateY(-100%) skewY(${OBLIQUE_ANGLE}deg)`,
                                        zIndex: 10,
                                    }}
                                />

                                {/* EXIT Wipe Shape */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: `${exitWipePos}%`,
                                        left: '-50%',
                                        width: '200%',
                                        height: `${WIPE_HEIGHT}px`,
                                        background: WIPE_COLOR,
                                        opacity: exitWipeOpacity,
                                        transform: `translateY(-100%) skewY(${OBLIQUE_ANGLE}deg)`,
                                        zIndex: 11,
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};
