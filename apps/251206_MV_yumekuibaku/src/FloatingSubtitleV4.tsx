import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, random, interpolate } from 'remotion';

// Rename interface if exported, or just keep it local
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
    // New Visibility Props
    shadowBlur?: number;
    shadowColor?: string;
    strokeWidth?: number;
    strokeColor?: string;
    durationInFrames?: number; // Needed for exit animation
}

export const FloatingSubtitleV4: React.FC<FloatingSubtitleProps> = ({
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

    // Exit Animation Configuration
    const EXIT_DURATION = 20; // Last N frames for exit

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
                        // Layered Shadow: Tight high-opacity shadow + Soft blur shadow
                        textShadow: `0 0 2px ${shadowColor}, 0 0 ${shadowBlur}px ${shadowColor}`,
                        WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : undefined,
                        padding: '20px 10px', // Increased padding to avoid cutting off glow
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

                        // ----------------------------------------------------
                        // ENTER ANIMATION
                        // ----------------------------------------------------
                        const relativeFrame = frame - enterFrame;
                        const startFrame = delay;

                        const enterProgress = spring({
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


                        // ----------------------------------------------------
                        // EXIT ANIMATION
                        // ----------------------------------------------------

                        // Fix for visibility: Ensure animation starts early enough for ALL characters.
                        // Calculate total stagger time roughly to ensure fit.
                        // Let's force start exit earlier.
                        const EXIT_BUFFER = 20; // Start 20 frames (approx 0.6s) before end.

                        // Stagger exit:
                        const exitStagger = globalIndex * 2;

                        // Start frame for THIS character
                        // We subtract staggered amount from the END point, or add to start point?
                        // Let's say we want the LAST char to finish exactly at end.
                        // But easier: Start base exit at "Duration - Buffer".
                        // And add stagger.
                        // If duration is too short, clamp it.

                        const baseExitStart = Math.max(0, durationInFrames - EXIT_BUFFER);
                        const exitStartFrame = baseExitStart + exitStagger;

                        // Check if we are past the start point
                        const isExiting = frame >= exitStartFrame;

                        // Use spring for smooth exit
                        // Note: If frame < exitStartFrame, spring is at 0 (clamped by logic or spring internal?)
                        // Actually better to clamp input frame to 0.

                        const exitRelativeFrame = Math.max(0, frame - exitStartFrame);

                        const exitProgress = spring({
                            frame: exitRelativeFrame,
                            from: 0,
                            to: 1,
                            fps,
                            config: {
                                damping: 15, // Lower damping = faster/bouncier
                                stiffness: 80,
                                mass: 0.5, // Lighter mass for quicker move
                            }
                        });


                        const charScale = getScale(char);
                        const finalFontSize = fontSize * charScale;

                        // ENTER Phase
                        const enterX = interpolate(enterProgress, [0, 1], [randomX, jitterX]);
                        const enterY = interpolate(enterProgress, [0, 1], [randomY, jitterY]);
                        const enterRot = interpolate(enterProgress, [0, 1], [randomRot, 0]);
                        const enterOpacity = interpolate(enterProgress, [0, 0.5], [0, 1]);
                        const enterScale = interpolate(enterProgress, [0, 1], [0.5, 1]);

                        // EXIT Phase Values
                        // More dramatic: Rotate 180deg vertical, Move Up significantly
                        const exitRotY = interpolate(exitProgress, [0, 1], [0, 180]); // Full flip
                        const exitRotX = interpolate(exitProgress, [0, 1], [0, 45]); // Slight tilt back
                        const exitOpacity = interpolate(exitProgress, [0, 0.6], [1, 0]); // Fade out faster
                        const exitY = interpolate(exitProgress, [0, 1], [0, -100]); // Float up higher
                        const exitScale = interpolate(exitProgress, [0, 1], [1, 0.8]); // Shrink slightly

                        // Combine
                        // If exiting, we blend AWAY from the Enter settled state.

                        const finalOpacity = enterOpacity * exitOpacity;

                        // Transform order: Translate -> Rotate -> Scale
                        // We add Exit translations to Enter translations
                        const curX = enterX; // No horizontal exit move for now
                        const curY = enterY + exitY;

                        const curRotZ = enterRot; // Original rotation (should be 0)

                        const finalTransform = `
                            translate(${curX}px, ${curY}px) 
                            rotate(${curRotZ}deg) 
                            rotateX(${exitRotX}deg)
                            rotateY(${exitRotY}deg) 
                            scale(${enterScale * exitScale})
                        `;

                        return (
                            <span
                                key={charIndex}
                                style={{
                                    fontSize: finalFontSize, // Set actual size affecting flow
                                    color: color,
                                    opacity: finalOpacity,
                                    transform: finalTransform,
                                    display: 'inline-block',
                                    // Make sure margins account for jitter to prevent overlap
                                    // A heuristic: reserve roughly 30-40% of jitter on each side
                                    margin: `${jitter * 0.35}px`,
                                    textAlign: 'center',
                                    lineHeight: '1em',
                                    backfaceVisibility: 'visible', // Visible during flip? or hidden for snap?
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
