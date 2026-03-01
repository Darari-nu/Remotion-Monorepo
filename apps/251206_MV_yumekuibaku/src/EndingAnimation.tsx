// src/EndingAnimation.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

export const EndingAnimation: React.FC = () => {
    const frame = useCurrentFrame();

    // Timing
    const startFrame = 607; // 00:20.23
    const animationDuration = 90; // ~3 seconds for movement
    const fadeStart = 45; // Start fading halfway through movement

    // Relative progress (0 to 1)
    const t = Math.max(0, frame - startFrame);
    if (t === 0 && frame < startFrame) return null; // Hide before start

    const progress = Math.min(t / animationDuration, 1);

    // Easing
    const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
    const smoothedProgress = interpolate(progress, [0, 1], [0, 1], {
        easing: ease,
    });

    // Movements
    // "全部": Moves Up
    const moveUp = interpolate(smoothedProgress, [0, 1], [0, -150]);

    // "食べ尽くして": Moves Down
    const moveDown = interpolate(smoothedProgress, [0, 1], [0, 150]);

    // "悪い夢にして": Stays then Rotates
    // Rotation starts at 40% of the movement duration
    const rotationProgress = interpolate(progress, [0.4, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.ease),
    });
    const rotate = interpolate(rotationProgress, [0, 1], [0, 15], { // Simple tilt rotation or full spin? "Rotates" -> usually means spin or tilt. Let's do a tilt + slight drift
        extrapolateRight: "clamp"
    });

    // Dissolve / Crumble Effect
    // Simulating "sand crumbling" via blur + opacity + spread
    // Start fading out towards the end
    const fadeProgress = interpolate(t, [fadeStart, animationDuration + 30], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const opacity = interpolate(fadeProgress, [0, 1], [1, 0]);
    const blur = interpolate(fadeProgress, [0, 1], [0, 20]); // Blur out
    const scale = interpolate(fadeProgress, [0, 1], [1, 1.2]); // Expand slightly as it dissipates
    const sandSpread = interpolate(fadeProgress, [0, 1], [0, 50]); // Letter spacing increases?

    const containerStyle: React.CSSProperties = {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif", // Or match project font
        fontWeight: "bold",
        fontSize: "80px",
        color: "white",
        filter: `blur(${blur}px)`,
        opacity: opacity,
        transform: `scale(${scale})`,
    };

    const textStyle: React.CSSProperties = {
        position: "absolute",
        textAlign: "center",
        whiteSpace: "nowrap",
        textShadow: "0px 0px 10px rgba(0,0,0,0.5)",
    };

    return (
        <AbsoluteFill style={{ backgroundColor: "transparent" }}>
            <div style={containerStyle}>
                {/* 全部 - Top */}
                <div style={{
                    ...textStyle,
                    transform: `translateY(${moveUp}px)`,
                    letterSpacing: `${sandSpread}px`, // Slight separation
                }}>
                    全部
                </div>

                {/* 悪い夢にして - Center */}
                <div style={{
                    ...textStyle,
                    transform: `rotate(${rotate * 20}deg) scale(${1 - rotationProgress * 0.2})`, // Rotate and shrink slightly
                    letterSpacing: `${sandSpread}px`,
                    opacity: 1 - rotationProgress * 0.5, // Fade faster? Or keep consistent
                }}>
                    悪い夢にして
                </div>

                {/* 食べ尽くして - Bottom */}
                <div style={{
                    ...textStyle,
                    transform: `translateY(${moveDown}px)`,
                    letterSpacing: `${sandSpread}px`,
                }}>
                    食べ尽くして
                </div>
            </div>
        </AbsoluteFill>
    );
};
