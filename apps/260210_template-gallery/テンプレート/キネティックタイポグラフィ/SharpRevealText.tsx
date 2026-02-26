import React from 'react';
import { useCurrentFrame, interpolate, Easing, random } from 'remotion';

export interface SharpRevealTextProps {
    text: string;
    mode?: 'wipe-right' | 'wipe-up' | 'slice-diagonal' | 'box-expand'; // Base mode, but we randomize internals
    fontSize?: number;
    color?: string;
    accentColor?: string; // Replaces wipeColor as primary shape color
    fontFamily?: string;
    lineGap?: number;
    letterSpacing?: string;
    vertical?: boolean;
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

    specialEndingAnimation?: boolean;
    lineThickness?: number; // For wipe, shutter, slice
    boxThickness?: number; // For box-expand
    hexagonThickness?: number; // For circle-expand (hexagon)
}

export const SharpRevealText: React.FC<SharpRevealTextProps> = ({
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
    jitter = 15,
    jitterRotation = 5,
    strokeWidth = 2,
    strokeColor = 'rgba(0,0,0,0.5)',
    shadowBlur = 10,
    shadowColor = 'rgba(0,0,0,0.8)',
    charDuration = 15, // Default animation duration per char
    specialEndingAnimation = false,
    lineThickness = 5,
    boxThickness = 5,
    hexagonThickness = 5,
}) => {
    const frame = useCurrentFrame();

    const getScale = (char: string) => {
        const isKanji = /[\u4e00-\u9faf\u3400-\u4dbf]/.test(char);
        const isKana = /[\u3040-\u309f\u30a0-\u30ff]/.test(char);
        if (isKanji) return kanjiScale;
        if (isKana) return kanaScale;
        return 1.0;
    };

    if (!text) return null;

    const lines = text.split('\n');

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row-reverse',
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

                        // Phase 1: Initial Move (0% - 40%)
                        // Phase 2: Secondary Move (40% - 100%)

                        // Global Blur/Fade for line container (reduced to let chars crumble visually)
                        // Fade out line container later than chars to keep container valid
                        lineOpacity = interpolate(t, [0.8, 1], [1, 0]);
                        // No strong blur on container, let chars blur/scatter

                        // --- Line Movements ---
                        if (lineIndex === 0) {
                            // "全部" 
                            // Phase 1: Move Up
                            // Phase 2: Diagonal (Up + Left/Right?)
                            const upVal = interpolate(t, [0, 0.4], [0, -100], { extrapolateRight: 'clamp' });
                            const diagX = interpolate(t, [0.4, 1], [0, 80], { extrapolateLeft: 'clamp' }); // Move Right
                            const diagY = interpolate(t, [0.4, 1], [0, -50], { extrapolateLeft: 'clamp' }); // Continue Up

                            lineTransform = { transform: `translate(${diagX}px, ${upVal + diagY}px)` };

                        } else if (lineIndex === 2) {
                            // "食べ尽くして"
                            // Phase 1: Move Down
                            // Phase 2: Diagonal
                            const downVal = interpolate(t, [0, 0.4], [0, 100], { extrapolateRight: 'clamp' });
                            const diagX = interpolate(t, [0.4, 1], [0, -80], { extrapolateLeft: 'clamp' }); // Move Left
                            const diagY = interpolate(t, [0.4, 1], [0, 50], { extrapolateLeft: 'clamp' }); // Continue Down

                            lineTransform = { transform: `translate(${diagX}px, ${downVal + diagY}px)` };

                        } else if (lineIndex === 1) {
                            // "悪い夢にして"
                            // Phase 1: Stay (or tiny drift)
                            // Phase 2: Nightmare Drift (Skew + Rotate + Scale)
                            // Goal: Create an eerie, "losing grip" feeling
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
                        writingMode: 'vertical-rl',
                        textOrientation: 'upright',
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

                            // 3. Jitter (Moved up)
                            const jX = (random(`${seed}-jx`) - 0.5) * jitter * 2;
                            const jY = (random(`${seed}-jy`) - 0.5) * jitter * 2;
                            const jR = (random(`${seed}-jr`) - 0.5) * jitterRotation * 2;

                            // --- Special Ending Calc (Phase 3: Crumbling) ---
                            let charTransform = {};
                            let charOpacity = 1;

                            if (specialEndingAnimation) {
                                const startAnimFrame = 187; // 20.23s
                                // Phase 3 starts towards the end of the movement
                                // Let's say crumble starts at 70% of the movement duration
                                const animDuration = 90;
                                const crumbleStart = startAnimFrame + (animDuration * 0.6);
                                const crumbleDuration = 40;


                                if (frame >= crumbleStart) {
                                    // Randomized Duration & Start Offset per char
                                    const durRandom = 0.5 + random(`${seed}-dur`) * 1.5; // 0.5x to 2.0x duration
                                    const startOffset = (random(`${seed}-start`) - 0.5) * 10; // +/- frames start

                                    const effectiveDuration = crumbleDuration * durRandom;
                                    const effectiveStart = crumbleStart + startOffset;

                                    if (frame >= effectiveStart) {
                                        const ct = Math.min((frame - effectiveStart) / effectiveDuration, 1);

                                        // Randomized easing power (acceleration)
                                        const easePower = 1 + random(`${seed}-ease`) * 3; // Power 1 to 4
                                        const easedCt = Math.pow(ct, easePower);

                                        // Random Scatter Direction and Rotation speed
                                        const dirX = (random(`${seed}-dx`) - 0.5); // Direction normal X
                                        const dirY = (random(`${seed}-dy`) - 0.5); // Direction normal Y
                                        // Normalize loosely? Nah, random magnitude is fine.

                                        const scatterDist = 300 * (0.8 + random(`${seed}-dist`) * 1.2); // 240 to 600 px

                                        const scatterX = dirX * scatterDist * easedCt;
                                        const scatterY = dirY * scatterDist * easedCt;

                                        // Random Rotation Direction & Speed
                                        const rotDir = random(`${seed}-rdir`) > 0.5 ? 1 : -1;
                                        const rotSpeed = 180 + random(`${seed}-rspd`) * 540; // 180 to 720 deg total
                                        const scatterR = rotDir * rotSpeed * easedCt;

                                        charTransform = {
                                            transform: `translate(${jX + scatterX}px, ${jY + scatterY}px) rotate(${jR + scatterR}deg)`,
                                        };
                                        // Fade out chars individually a bit
                                        charOpacity = interpolate(ct, [0, 0.8], [1, 0]);
                                    }
                                }
                            }

                            const finalFontSize = fontSize * charScale;

                            // 2. Modes
                            const modes = [
                                'wipe-right', 'wipe-up', 'slice-diagonal',
                                'box-expand', 'circle-expand', 'diamond-expand', 'shutter-vertical'
                            ] as const;
                            const randomModeIndex = Math.floor(random(seed) * modes.length);
                            const charMode = modes[randomModeIndex];
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

                            const containerStyle: React.CSSProperties = {
                                position: 'relative',
                                display: 'inline-block',
                                fontSize: finalFontSize,
                                color,
                                overflow: 'visible',
                                width: 'fit-content',
                                height: 'fit-content',
                                verticalAlign: 'middle',
                                transform: `translate(${jX}px, ${jY}px) rotate(${jR}deg)`,
                                textShadow: `0 0 ${shadowBlur}px ${shadowColor}`,
                                WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : undefined,
                                ...charTransform, // Apply crumbling scatter
                                opacity: charOpacity, // fade out char
                            };

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
                                            // The original code was: top: isUp ? `${val}%` : `${100 - val}%`. 
                                            // Let's stick closer to the "straight line" leading edge concept.
                                            // For wipe-right (assuming horizontal text? No, vertical-rl).
                                            // Wait, `vertical-rl` means "wipe-right" is actually wiping DOWN visually?
                                            // Let's just fix the THICKNESS first.

                                            // For "straight line is too thick":
                                            // This div acts as the leading edge bar.
                                            height: `${lineThickness}px`, // Use prop
                                            width: '120%',
                                            left: '-10%',

                                            // Positioning needs to be centered on the cut.
                                            // if Up: top is val%. Line should be centered there? 
                                            // transforms: translateY(-50%) handles centering if top is set.
                                            top: isUp ? `${val}%` : `${100 - val}%`,

                                            background: finalShapeColor,
                                            transform: 'translateY(-50%)',
                                            opacity: shapeOpacity,
                                            zIndex: 10,
                                            boxShadow: 'none', // shapes have no shadow
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
                                            width: `${lineThickness}px`, height: '110%', // Use prop
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
                                            border: `${boxThickness}px solid ${finalShapeColor}`, // Use prop
                                            opacity: boxOpacity,
                                            pointerEvents: 'none',
                                            textShadow: 'none',
                                        }} />
                                    </div>
                                );
                            }

                            // HEXAGON EXPAND (Replaces Circle)
                            if (charMode === 'circle-expand') { // Keeping internal name or switching to 'hexagon-expand' if preferred, but simpler to just swap implementation if mode name is random matches
                                // Let's implement Hexagon logic
                                const p = interpolate(progress, [0, 1], [0, 100]); // scale %
                                const ringOpacity = interpolate(progress, [0.8, 1], [1, 0]);

                                // SVG Hexagon
                                // Points for flat-topped hex: 25,0 75,0 100,50 75,100 25,100 0,50
                                return (
                                    <div key={charIndex} style={containerStyle}>
                                        <div style={{ clipPath: `circle(${p}% at 50% 50%)` }}>{char}</div>
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%', left: '50%',
                                            width: '150%', height: '150%', // Larger container for shape
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
                            if (charMode === 'shutter-vertical') {
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
                                            opacity: interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]), // Fade in at start, fade out at end
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
