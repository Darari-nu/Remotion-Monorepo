// src/CombinedVideo.tsx
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { MainVideo } from "./Composition";
import { EndingAnimation } from "./EndingAnimation";

export const CombinedVideo: React.FC = () => {
    return (
        <AbsoluteFill>
            {/* メイン映像（全体） */}
            <Sequence from={0} durationInFrames={Infinity}>
                <MainVideo
                    subtitleStyle={{
                        fontSize: 60,
                        color: "#ffffff",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        padding: 20,
                        borderRadius: 10,
                        bottomOffset: 120,
                        fontFamily: "sans-serif",
                    }}
                />
            </Sequence>

            {/* エンディングアニメーション（重ね合わせ） */}
            <Sequence from={0} durationInFrames={Infinity}>
                <EndingAnimation />
            </Sequence>
        </AbsoluteFill>
    );
};
