import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, random } from 'remotion';

interface RetroSubtitleProps {
    text: string;
    enterFrame: number;
    fontSize?: number;
    color?: string;
    letterSpacing?: string;
    animationSpeed?: number;
}

export const RetroSubtitle: React.FC<RetroSubtitleProps> = ({
    text,
    enterFrame,
    fontSize = 80,
    color = '#ffffff',
    letterSpacing = '0.1em',
    animationSpeed = 15,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Split text into lines
    const lines = useMemo(() => text.split('\n'), [text]);

    // Calculate total characters to map distinct seeds if needed,
    // but mapping by line index and char index is sufficient.

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
                flexDirection: 'row-reverse', // Lines flow from Right to Left
                gap: '1em', // Gap between lines
            }}
        >
            {lines.map((line, lineIndex) => (
                <div
                    key={lineIndex}
                    style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'upright',
                        fontFamily: '"Zen Old Mincho", "Hiragino Mincho ProN", serif',
                        fontSize: fontSize,
                        color: color,
                        display: 'flex',
                        flexWrap: 'nowrap', // Don't wrap distinct chars within a line container
                        gap: letterSpacing,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        padding: '20px 10px',
                        borderRadius: '8px',
                        maxHeight: '80%',
                    }}
                >
                    {line.split('').map((char, charIndex) => {
                        // Deterministic random based on text content and position
                        // Combining line and char index to ensure uniqueness
                        const seed = `${text}-${lineIndex}-${charIndex}`;
                        const maxDelay = 30; // 1 second buffer
                        const delay = Math.floor(random(seed) * maxDelay);

                        const relativeFrame = frame - enterFrame;
                        const startFrame = delay;

                        const progress = spring({
                            frame: relativeFrame,
                            from: 0,
                            to: 1,
                            fps,
                            delay: startFrame,
                            config: {
                                damping: 200,
                            }
                        });

                        const opacity = Math.min(1, Math.max(0, (relativeFrame - startFrame) / animationSpeed));

                        return (
                            <span
                                key={charIndex}
                                style={{
                                    opacity: opacity,
                                    transform: `scale(${0.8 + 0.2 * progress}) translateY(${(1 - progress) * 10}px)`,
                                    display: 'inline-block',
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
