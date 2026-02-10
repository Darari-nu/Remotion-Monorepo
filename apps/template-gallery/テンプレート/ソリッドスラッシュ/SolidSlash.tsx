import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, useVideoConfig, random } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const solidSlashSchema = z.object({
    text: z.string().default('未来'),
    secondaryText: z.string().default('創造'),
    primaryColor: zColor().default('#000000'),
    secondaryColor: zColor().default('#808080'),
    backgroundColor: zColor().default('#ffffff'),
    duration: z.number().default(150),
});

const SharpEasing = Easing.bezier(0.1, 0.9, 0.2, 1.0); // Very snappy

export const SolidSlash: React.FC<z.infer<typeof solidSlashSchema>> = ({
    text,
    secondaryText,
    primaryColor,
    secondaryColor,
    backgroundColor,
    duration,
}) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // Phase 1: The "Slash" - Skewed diagonal wipe (0-20 frames)
    const renderSlash = () => {
        if (frame > 25) return null;

        const progress = interpolate(frame, [0, 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: SharpEasing
        });

        const xPositions = interpolate(progress, [0, 0.5, 1], [-width, 0, width]);

        return (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transform: `translateX(${interpolate(frame, [5, 6, 7], [0, 50, 0])}px)`
            }}>
                <div style={{
                    position: 'absolute',
                    width: '400px',
                    height: '200%',
                    backgroundColor: primaryColor,
                    transform: `translateX(${xPositions}px) skewX(-20deg)`,
                }} />
                <div style={{
                    position: 'absolute',
                    width: '100px',
                    height: '200%',
                    backgroundColor: secondaryColor,
                    transform: `translateX(${xPositions - 300}px) skewX(-20deg)`,
                }} />
            </div>
        );
    };

    // Phase 2: Shard Explosion (15-40 frames)
    const renderShards = () => {
        if (frame < 15 || frame > 40) return null;
        const progress = interpolate(frame, [15, 35], [0, 1], { easing: SharpEasing });

        return (
            <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
                {new Array(10).fill(0).map((_, i) => {
                    const angle = (i / 10) * 360;
                    const dist = interpolate(progress, [0, 1], [0, 1000]);
                    const scale = interpolate(progress, [0, 1], [1, 0]);
                    const x = Math.cos(angle * Math.PI / 180) * dist;
                    const y = Math.sin(angle * Math.PI / 180) * dist;

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                width: 0,
                                height: 0,
                                borderLeft: '50px solid transparent',
                                borderRight: '50px solid transparent',
                                borderBottom: `150px solid ${i % 2 === 0 ? primaryColor : secondaryColor}`,
                                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle + 90}deg) scale(${scale})`,
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    // Phase 3: Text 1 (25-70 frames) - Stays until transition
    const renderText1 = () => {
        // Disappears when transition starts (around frame 70)
        if (frame < 25 || frame > 80) return null;

        // Exit animation (70-80)
        const exitProgress = interpolate(frame, [70, 80], [0, 1], { extrapolateRight: 'clamp' });
        const exitScale = interpolate(exitProgress, [0, 1], [1, 1.5]);
        const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

        const chars = text.split('');
        const progress = interpolate(frame, [30, 40], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: SharpEasing
        });

        return (
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                display: 'flex',
                gap: '20px',
                transform: `translate(-50%, -50%) scale(${exitScale})`,
                opacity: exitOpacity,
            }}>
                {chars.map((char, i) => {
                    const dirX = i % 2 === 0 ? -300 : 300;
                    const dirY = i % 3 === 0 ? -300 : 300;

                    const x = interpolate(progress, [0, 1], [dirX, 0]);
                    const y = interpolate(progress, [0, 1], [dirY, 0]);
                    const opacity = interpolate(progress, [0, 0.8], [0, 1]);
                    const scale = interpolate(progress, [0, 0.8, 1], [2, 0.9, 1]);

                    return (
                        <h1
                            key={i}
                            style={{
                                fontSize: '250px',
                                fontFamily: '"Zen Old Mincho", serif',
                                fontWeight: 900,
                                color: primaryColor,
                                margin: 0,
                                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                                opacity,
                            }}
                        >
                            {char}
                        </h1>
                    );
                })}
            </div>
        );
    };

    // Phase 4: Transition - "Shutter Attack" (70-90 frames)
    // Geometric shapes slamming to cover/reveal
    const renderTransition = () => {
        if (frame < 70 || frame > 100) return null;

        // 0-0.5: Slam IN (Cover), 0.5-1.0: Slam OUT (Reveal)
        const progress = interpolate(frame, [70, 90], [0, 1], {
            easing: Easing.bezier(0.8, 0, 0.2, 1) // Ease in-out extremely sharp
        });

        // Upper block
        const y1 = interpolate(progress, [0, 0.5, 1], [-height, 0, -height]);
        // Lower block
        const y2 = interpolate(progress, [0, 0.5, 1], [height, 0, height]);

        // Flash color at moment of impact (middle)
        const isImpact = frame >= 79 && frame <= 81;
        const flashColor = isImpact ? secondaryColor : primaryColor;

        return (
            <>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '50%',
                    backgroundColor: flashColor,
                    transform: `translateY(${y1}px)`,
                    zIndex: 10
                }} />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    width: '100%',
                    height: '50%',
                    backgroundColor: flashColor,
                    transform: `translateY(${y2}px)`,
                    zIndex: 10
                }} />
            </>
        );
    };

    // Phase 5: Text 2 (80+ frames)
    const renderText2 = () => {
        if (frame < 80) return null;

        const chars = secondaryText.split('');
        // Appear right after shutter impact
        const progress = interpolate(frame, [80, 90], [0, 1], {
            easing: SharpEasing
        });

        return (
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                display: 'flex',
                gap: '20px',
                transform: 'translate(-50%, -50%)',
            }}>
                {chars.map((char, i) => {
                    // Different animation: Slide from center split
                    const offset = (i - (chars.length - 1) / 2) * 50;
                    // Start from center (0) to actual position (offset) causes expansion
                    // But let's do a vertical slice effect

                    const y = interpolate(progress, [0, 1], [100 * (i % 2 === 0 ? -1 : 1), 0]);
                    const opacity = interpolate(progress, [0, 0.5], [0, 1]);
                    const skew = interpolate(progress, [0, 1], [45, 0]);

                    return (
                        <h1
                            key={i}
                            style={{
                                fontSize: '250px',
                                fontFamily: '"Zen Old Mincho", serif',
                                fontWeight: 900,
                                color: primaryColor, // Maybe swap animation style?
                                margin: 0,
                                transform: `translateY(${y}px) skewX(${skew}deg)`,
                                opacity,
                            }}
                        >
                            {char}
                        </h1>
                    );
                })}
            </div>
        );
    };

    // Background Lines (Persistent with change)
    const renderBgLines = () => {
        if (frame < 20) return null;
        const rotate = frame * 10;

        // Switch direction after transition
        const dir = frame > 80 ? -1 : 1;

        return (
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '200%',
                height: '200%',
                transform: `translate(-50%, -50%) rotate(${rotate * dir}deg)`,
                zIndex: 0,
                opacity: 0.2
            }}>
                {new Array(12).fill(0).map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '100%',
                        height: '20px',
                        backgroundColor: secondaryColor,
                        transform: `rotate(${i * 30}deg) translateX(200px)`,
                    }} />
                ))}
            </div>
        );
    }

    return (
        <AbsoluteFill style={{ backgroundColor, overflow: 'hidden' }}>
            {renderBgLines()}
            {renderSlash()}
            {renderShards()}
            {renderText1()}
            {renderTransition()}
            {renderText2()}
        </AbsoluteFill>
    );
};
