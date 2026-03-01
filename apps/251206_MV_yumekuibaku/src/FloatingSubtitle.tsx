import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, random, interpolate } from 'remotion';

interface FloatingSubtitleProps {
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
}

export const FloatingSubtitle: React.FC<FloatingSubtitleProps> = ({
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

    // Flatten lines to calculate global index for sequential timing
    const flatChars: { char: string; lineIndex: number; charIndex: number }[] = [];
    text.split('\n').forEach((line, lineIndex) => {
        line.split('').forEach((char, charIndex) => {
            flatChars.push({ char, lineIndex, charIndex });
        });
    });

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
                flexDirection: 'row-reverse',
                gap: `${lineGap}px`, // Use lineGap for spacing between vertical lines
            }}
        >
            {text.split('\n').map((line, lineIndex) => (
                <div
                    key={lineIndex}
                    style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'upright',
                        fontFamily: '"Zen Old Mincho", "Hiragino Mincho ProN", serif',
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: letterSpacing,
                        // Remove background box for floating feel? Or keep it subtle?
                        // Let's keep it very transparent or remove it for "Floating" feel.
                        // Removing background for cleaner "floating" look.
                        textShadow: '0 0 10px rgba(0,0,0,0.5)',
                        padding: '20px 10px',
                        alignItems: 'center', // Center chars horizontally within the vertical line
                    }}
                >
                    {line.split('').map((char, charIndex) => {
                        const seed = `${text}-${lineIndex}-${charIndex}`;

                        // Calculate global index for this char to ensure correct sequential order
                        // Since we are mapping inside nested loops, we need to count previous chars
                        let globalIndex = 0;
                        for (let l = 0; l < lineIndex; l++) {
                            // Note: text.split('\n')[l] might be slightly expensive in loop but negligible for subtitles
                            globalIndex += text.split('\n')[l].length;
                        }
                        globalIndex += charIndex;

                        // Random positions for fly-in (keep this random)
                        const randomX = (random(seed) - 0.5) * 2 * spread;
                        const randomY = (random(seed + 'y') - 0.5) * 2 * spread;
                        const randomRot = (random(seed + 'r') - 0.5) * 60;

                        // Jitter (Static deviation from grid)
                        const jitterX = (random(seed + 'jx') - 0.5) * 2 * jitter;
                        const jitterY = (random(seed + 'jy') - 0.5) * 2 * jitter;
                        // const jitterRot = (random(seed + 'jr') - 0.5) * 10; // Maybe rotation jitter too? let's stick to pos first

                        // Use stagger prop for delay
                        const delay = globalIndex * stagger;

                        const relativeFrame = frame - enterFrame;
                        const startFrame = delay;
                        // const fadeDuration = animationSpeed; // Unused, opacity uses interpolate directly

                        const progress = spring({
                            frame: relativeFrame,
                            from: 0,
                            to: 1,
                            fps,
                            delay: startFrame,
                            config: {
                                damping: damping,
                                stiffness: stiffness,
                            }
                        });


                        const charScale = getScale(char);
                        const finalFontSize = fontSize * charScale; // Apply scale to layout size

                        // Interpolate position
                        // Fly in from random pos -> settle at jitter pos
                        const translateX = interpolate(progress, [0, 1], [randomX, jitterX]);
                        const translateY = interpolate(progress, [0, 1], [randomY, jitterY]);
                        const rotate = interpolate(progress, [0, 1], [randomRot, 0]); // Maybe add jitter rot here if desired
                        const opacity = interpolate(progress, [0, 0.5], [0, 1]);
                        const animScale = interpolate(progress, [0, 1], [0.5, 1]); // Animation scale only

                        return (
                            <span
                                key={charIndex}
                                style={{
                                    fontSize: finalFontSize, // Set actual size affecting flow
                                    color: color,
                                    opacity: opacity,
                                    transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${animScale})`,
                                    display: 'inline-block',
                                    // Make sure margins account for jitter to prevent overlap
                                    // A heuristic: reserve roughly 30-40% of jitter on each side
                                    margin: `${jitter * 0.35}px`,
                                    textAlign: 'center',
                                    lineHeight: '1em',
                                }}
                            >
                                {char}
                            </span>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};
