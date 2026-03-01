import React from 'react';
import { useCurrentFrame, interpolate, Easing, random } from 'remotion';

export interface TitleRevealTextProps {
    text: string;
    mode?: 'wipe-right' | 'wipe-up' | 'slice-diagonal' | 'box-expand' | 'shutter' | 'circle-expand';
    fontSize?: number;
    color?: string;
    accentColor?: string; // Replaces wipeColor as primary shape color
    fontFamily?: string;
    lineGap?: number;
    letterSpacing?: string;
    stagger?: number;
    kanjiScale?: number;
    kanaScale?: number;
    jitter?: number;
    jitterRotation?: number;
    strokeWidth?: number;
    strokeColor?: string;
    shadowBlur?: number;
    shadowColor?: string;
    durationInFrames?: number;
    charDuration?: number; // New: Controls per-character animation speed
    fadeOutDuration?: number; // Adjust fade out timing (frames from end)

    specialEndingAnimation?: boolean;
    lineThickness?: number; // For wipe, shutter, slice
    boxThickness?: number; // For box-expand
    hexagonThickness?: number; // For circle-expand (hexagon)

    // Cycle Mode Props (Opacity Only)
    cycleMode?: boolean;
    d1?: number; // Active duration
    d2?: number; // Dim duration
    d3?: number; // Faint duration

    // Visibility Props
    edgeOutline?: boolean;
    edgeOutlineColor?: string;
}

export const TitleRevealText: React.FC<TitleRevealTextProps> = ({
    text,
    fontSize = 80,
    color = '#FFFFFF',
    accentColor = '#808080',
    fontFamily = '"Zen Old Mincho", "Hiragino Mincho ProN", serif',
    lineGap = 200,
    letterSpacing = '0.4em',
    stagger = 3,
    kanjiScale = 1.1,
    kanaScale = 0.9,
    jitter = 0,
    jitterRotation = 0,
    strokeWidth = 2,
    strokeColor = 'rgba(0,0,0,0.5)',
    shadowBlur = 10,
    shadowColor = 'rgba(0,0,0,0.8)',
    charDuration = 15, // Default animation duration per char
    fadeOutDuration = 0,
    durationInFrames,
    specialEndingAnimation = false,
    lineThickness = 5,
    boxThickness = 5,
    hexagonThickness = 5,

    // Cycle Defaults
    cycleMode = false,
    d1 = 0,
    d2 = 0,
    d3 = 0,

    edgeOutline = false,
    edgeOutlineColor = '#000000',
    mode,
}) => {
    const frame = useCurrentFrame();

    const getScale = (char: string) => {
        if (char === '？' || char === '?') return kanjiScale;
        // Kanji OR Digits (Half-width 0-9, Full-width ０-９) -> Scale 4 (or kanjiScale)
        const isKanjiOrDigit = /[\u4e00-\u9faf\u3400-\u4dbf0-9０-９]/.test(char);
        const isKana = /[\u3040-\u309f\u30a0-\u30ff]/.test(char);
        if (isKanjiOrDigit) return kanjiScale;
        if (isKana) return kanaScale;
        return 1.0;
    };

    if (!text) return null;

    const lines = text.split('\n');

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${lineGap}px`,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            {lines.map((line, lineIndex) => {
                // Calculate Exit Animation if enabled
                // "全部" (line 0) -> Move Up
                // "悪い夢にして" (line 1) -> Rotate
                // "食べ尽くして" (line 2) -> Move Down
                // Start at 00:20.23 -> frame 607 (relative to video start, but THIS component uses relative frame from Sequence start)
                // Wait, SharpRevealText receives `frame` from useCurrentFrame() which is relative to the Sequence if used inside Sequence!
                // Since V6 uses Sequence, this frame starts at 0.
                // The sequence starts at 14.0s (420f).
                // The animation happens at 20.23s (607f).
                // So relative usage time is 607 - 420 = 187 frame.

                let lineTransform: React.CSSProperties = {};
                let lineOpacity = 1;
                let lineFilter = "none";

                if (specialEndingAnimation) {
                    const startAnimFrame = 187; // 20.23s
                    const animDuration = 90; // Total main sequence duration

                    if (frame >= startAnimFrame) {
                        const t = Math.min((frame - startAnimFrame) / animDuration, 1);

                        // Global Blur/Fade for line container (reduced to let chars crumble visually)
                        lineOpacity = interpolate(t, [0.8, 1], [1, 0]);

                        // --- Line Movements ---
                        if (lineIndex === 0) {
                            // "全部" 
                            const upVal = interpolate(t, [0, 0.4], [0, -100], { extrapolateRight: 'clamp' });
                            const diagX = interpolate(t, [0.4, 1], [0, 80], { extrapolateLeft: 'clamp' }); // Move Right
                            const diagY = interpolate(t, [0.4, 1], [0, -50], { extrapolateLeft: 'clamp' }); // Continue Up
                            lineTransform = { transform: `translate(${diagX}px, ${upVal + diagY}px)` };

                        } else if (lineIndex === 2) {
                            // "食べ尽くして"
                            const downVal = interpolate(t, [0, 0.4], [0, 100], { extrapolateRight: 'clamp' });
                            const diagX = interpolate(t, [0.4, 1], [0, -80], { extrapolateLeft: 'clamp' }); // Move Left
                            const diagY = interpolate(t, [0.4, 1], [0, 50], { extrapolateLeft: 'clamp' }); // Continue Down
                            lineTransform = { transform: `translate(${diagX}px, ${downVal + diagY}px)` };

                        } else if (lineIndex === 1) {
                            // "悪い夢にして"
                            const rotateVal = interpolate(t, [0.4, 1], [0, -5], {
                                easing: Easing.bezier(0.33, 1, 0.68, 1),
                                extrapolateLeft: 'clamp'
                            });
                            const skewVal = interpolate(t, [0.4, 1], [0, 5], {
                                extrapolateLeft: 'clamp'
                            });
                            const scaleVal = interpolate(t, [0.4, 1], [1, 0.9], {
                                extrapolateLeft: 'clamp'
                            });
                            lineTransform = { transform: `rotate(${rotateVal}deg) skewY(${skewVal}deg) scale(${scaleVal})` };
                        }
                    }
                }

                return (
                    <div key={lineIndex} style={{
                        writingMode: 'horizontal-tb',
                        fontFamily,
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: letterSpacing,
                        alignItems: 'center',
                        transition: 'opacity 0.1s', // Smoother fade if discrete
                        opacity: lineOpacity,
                        filter: lineFilter,
                        ...lineTransform,
                    }}>
                        {line.split('').map((char, charIndex) => {
                            // 1. Calculations
                            const charScale = getScale(char);
                            const seed = `${text}-${lineIndex}-${charIndex}`;

                            // 3. Jitter
                            const jX = (random(`${seed}-jx`) - 0.5) * jitter * 2;
                            const jY = (random(`${seed}-jy`) - 0.5) * jitter * 2;
                            const jR = (random(`${seed}-jr`) - 0.5) * jitterRotation * 2;

                            // --- Special Ending Calc (Phase 3: Crumbling) ---
                            let charTransform = {};

                            if (specialEndingAnimation) {
                                const startAnimFrame = 187; // 20.23s
                                const animDuration = 90;
                                const crumbleStart = startAnimFrame + (animDuration * 0.6);
                                const crumbleDuration = 40;

                                if (frame >= crumbleStart) {
                                    const durRandom = 0.5 + random(`${seed}-dur`) * 1.5;
                                    const startOffset = (random(`${seed}-start`) - 0.5) * 10;
                                    const effectiveDuration = crumbleDuration * durRandom;
                                    const effectiveStart = crumbleStart + startOffset;

                                    if (frame >= effectiveStart) {
                                        const ct = Math.min((frame - effectiveStart) / effectiveDuration, 1);
                                        const easePower = 1 + random(`${seed}-ease`) * 3;
                                        const easedCt = Math.pow(ct, easePower);
                                        const dirX = (random(`${seed}-dx`) - 0.5);
                                        const dirY = (random(`${seed}-dy`) - 0.5);
                                        const scatterDist = 300 * (0.8 + random(`${seed}-dist`) * 1.2);
                                        const scatterX = dirX * scatterDist * easedCt;
                                        const scatterY = dirY * scatterDist * easedCt;
                                        const rotDir = random(`${seed}-rdir`) > 0.5 ? 1 : -1;
                                        const rotSpeed = 180 + random(`${seed}-rspd`) * 540;
                                        const scatterR = rotDir * rotSpeed * easedCt;

                                        charTransform = {
                                            transform: `translate(${jX + scatterX}px, ${jY + scatterY}px) rotate(${jR + scatterR}deg)`,
                                        };
                                    }
                                }
                            }

                            const finalFontSize = fontSize * charScale;

                            // 2. Modes
                            const modes = [
                                'wipe-right', 'wipe-up', 'slice-diagonal',
                                'box-expand', 'circle-expand', 'diamond-expand', 'shutter'
                            ] as const;
                            const charMode = mode || modes[Math.floor(random(seed) * modes.length)];
                            const finalShapeColor = accentColor;

                            // 4. Timing
                            let globalIndex = 0;
                            for (let l = 0; l < lineIndex; l++) globalIndex += lines[l].length;
                            globalIndex += charIndex;
                            const charDelay = globalIndex * stagger;

                            // 5. Animation Progress
                            const sharpEase = Easing.bezier(0.87, 0, 0.13, 1);
                            const rawProgress = interpolate(
                                frame - charDelay,
                                [0, charDuration], // Configurable duration
                                [0, 1],
                                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                            );
                            const progress = sharpEase(rawProgress);

                            // --- Fade Out / Gravity Fall Logic ---
                            let fadeOutOpacity = 1;
                            let gravityY = 0;

                            if (durationInFrames) {
                                const fadeStart = durationInFrames - fadeOutDuration;

                                // Even slower staggered start (25 -> 40 frames range)
                                const fallDelay = random(seed + '-fall') * 40;
                                const effectiveFadeStart = fadeStart + fallDelay;

                                if (frame >= effectiveFadeStart) {
                                    const fallProgress = interpolate(
                                        frame,
                                        [effectiveFadeStart, durationInFrames],
                                        [0, 1],
                                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                                    );

                                    // Linear slide down instead of gravity fall (Easing.linear)
                                    // Slower distance (120 -> 80)
                                    gravityY = interpolate(fallProgress, [0, 1], [0, 80]);

                                    // Fade starts immediately with the movement (0.2 -> 0.0)
                                    fadeOutOpacity = interpolate(fallProgress, [0, 1], [1, 0]);
                                }
                            }

                            // --- Cycle Mode Opacity Logic ---
                            let cycleOpacity = 1;

                            if (cycleMode) {
                                if (frame < d1) {
                                    // Active Phase
                                    cycleOpacity = 1;
                                } else if (frame < d1 + d2) {
                                    // Dim Phase: 1.0 -> 0.3
                                    cycleOpacity = interpolate(frame, [d1, d1 + 20], [1, 0.3], {
                                        extrapolateLeft: 'clamp',
                                        extrapolateRight: 'clamp',
                                    });
                                } else {
                                    // Faint Phase: 0.3 -> 0.05
                                    cycleOpacity = interpolate(frame, [d1 + d2, d1 + d2 + 30], [0.3, 0.05], {
                                        extrapolateLeft: 'clamp',
                                        extrapolateRight: 'clamp',
                                    });
                                }
                            }

                            // No Drift for Title
                            const driftX = 0;
                            const driftY = 0;
                            const isQuestion = ['？', '?'].includes(char);

                            const containerStyle: React.CSSProperties = {
                                marginTop: isQuestion ? '0.3em' : undefined,
                                position: 'relative',
                                display: 'inline-block',
                                fontSize: finalFontSize,
                                color,
                                overflow: 'visible',
                                width: 'fit-content',
                                height: 'fit-content',
                                verticalAlign: 'middle',
                                transform: `translate(${jX + driftX}px, ${jY + driftY + gravityY}px) rotate(${jR}deg)`,
                                textShadow: edgeOutline
                                    ? `-${1}px -${1}px 0 ${edgeOutlineColor}, ${1}px -${1}px 0 ${edgeOutlineColor}, -${1}px ${1}px 0 ${edgeOutlineColor}, ${1}px ${1}px 0 ${edgeOutlineColor}, 0 0 ${shadowBlur}px ${shadowColor}`
                                    : `0 0 ${shadowBlur}px ${shadowColor}`,
                                WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : undefined,
                                ...charTransform, // Apply crumbling scatter
                                opacity: cycleOpacity, // Only cycleOpacity here, reveal handled by shapes inside? 
                                // wait, original code multiplied revealOpacity.
                                // I need revealOpacity for char fade in.
                            };

                            // Base reveal opacity
                            const revealOpacity = interpolate(progress, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' });
                            containerStyle.opacity = revealOpacity * cycleOpacity * fadeOutOpacity;

                            const shapeOpacity = (rawProgress <= 0.01 || rawProgress >= 0.99) ? 0 : 1;

                            // --- MODES ---

                            // WIPE
                            if (charMode === 'wipe-right' || charMode === 'wipe-up') {
                                const isUp = charMode === 'wipe-up';
                                const val = interpolate(progress, [0, 1], [100, 0]);
                                const clipPath = isUp
                                    ? `inset(${val}% 0 0 0)`
                                    : `inset(0 0 ${val}% 0)`;

                                return (
                                    <div key={charIndex} style={containerStyle}>
                                        <div style={{ clipPath }}>{char}</div>
                                        <div style={{
                                            position: 'absolute',
                                            height: `${lineThickness}px`,
                                            width: '120%',
                                            left: '-10%',
                                            top: isUp ? `${val}%` : `${100 - val}%`,
                                            background: finalShapeColor,
                                            transform: 'translateY(-50%)',
                                            opacity: shapeOpacity,
                                            zIndex: 10,
                                            boxShadow: 'none',
                                            textShadow: 'none',
                                            WebkitTextStroke: '0',
                                        }} />
                                    </div>
                                );
                            }

                            // SLICE
                            if (charMode === 'slice-diagonal') {
                                const p = interpolate(progress, [0, 1], [0, 150]);
                                const tilt = 20;
                                const clipPath = `polygon(-50% 0%, ${p}% 0%, ${p - tilt}% 100%, -50% 100%)`;
                                return (
                                    <div key={charIndex} style={containerStyle}>
                                        <div style={{ clipPath }}>{char}</div>
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: `${p}%`,
                                            width: `${lineThickness}px`, height: '110%',
                                            background: finalShapeColor,
                                            transform: `skewX(-${15}deg) translateX(-50%)`,
                                            marginTop: '-5%',
                                            opacity: shapeOpacity,
                                            zIndex: 10,
                                            textShadow: 'none',
                                        }} />
                                    </div>
                                );
                            }

                            // BOX EXPAND
                            if (charMode === 'box-expand') {
                                const ins = interpolate(progress, [0, 1], [50, 0]);
                                const clipPath = `inset(${ins}% ${ins}% ${ins}% ${ins}%)`;
                                const boxOpacity = interpolate(progress, [0.0, 0.2, 0.8, 1], [0, 1, 1, 0]);

                                return (
                                    <div key={charIndex} style={containerStyle}>
                                        <div style={{ clipPath }}>{char}</div>
                                        <div style={{
                                            position: 'absolute',
                                            top: `${ins}%`, left: `${ins}%`, right: `${ins}%`, bottom: `${ins}%`,
                                            border: `${boxThickness}px solid ${finalShapeColor}`,
                                            opacity: boxOpacity,
                                            pointerEvents: 'none',
                                            textShadow: 'none',
                                        }} />
                                    </div>
                                );
                            }

                            // HEXAGON EXPAND
                            if (charMode === 'circle-expand') {
                                const p = interpolate(progress, [0, 1], [0, 100]);
                                const ringOpacity = interpolate(progress, [0.8, 1], [1, 0]);

                                return (
                                    <div key={charIndex} style={containerStyle}>
                                        <div style={{ clipPath: `circle(${p}% at 50% 50%)` }}>{char}</div>
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%', left: '50%',
                                            width: '150%', height: '150%',
                                            transform: 'translate(-50%, -50%) scale(' + (p / 50) + ')',
                                            opacity: ringOpacity,
                                            pointerEvents: 'none',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                                <polygon
                                                    points="25,5 75,5 95,50 75,95 25,95 5,50"
                                                    fill="none"
                                                    stroke={finalShapeColor}
                                                    strokeWidth={hexagonThickness}
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                );
                            }

                            // DIAMOND EXPAND
                            if (charMode === 'diamond-expand') {
                                const p = interpolate(progress, [0, 1], [0, 100]);
                                const h = p / 2 * 2.5;
                                const clip = `polygon(50% ${50 - h}%, ${50 + h}% 50%, 50% ${50 + h}%, ${50 - h}% 50%)`;
                                return (
                                    <div key={charIndex} style={containerStyle}>
                                        <div style={{ clipPath: clip }}>{char}</div>
                                    </div>
                                );
                            }

                            // SHUTTER VERTICAL
                            if (charMode === 'shutter') {
                                const p = interpolate(progress, [0, 1], [50, 0]);
                                const clipPath = `inset(${p}% 0 ${p}% 0)`;
                                return (
                                    <div key={charIndex} style={containerStyle}>
                                        <div style={{ clipPath }}>{char}</div>
                                        <div style={{
                                            position: 'absolute',
                                            top: `${p}%`, bottom: `${p}%`, left: 0, right: 0,
                                            borderTop: `${lineThickness}px solid ${finalShapeColor}`,
                                            borderBottom: `${lineThickness}px solid ${finalShapeColor}`,
                                            opacity: interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
                                            textShadow: 'none',
                                        }} />
                                    </div>
                                );
                            }

                            return <span key={charIndex} style={containerStyle}>{char}</span>;
                        })}
                    </div>
                );
            })}
        </div>
    );
};
