import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

// 自前のアニメーションコンポーネント（remotion-animationの代替）
interface AnimationProps {
  children: React.ReactNode;
  duration: number;
  type: "bounceIn" | "flipInX" | "fadeInUp";
}

const Animation: React.FC<AnimationProps> = ({ children, duration, type }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
  });

  let style: React.CSSProperties = {};

  switch (type) {
    case "bounceIn": {
      const s = spring({ frame, fps, config: { damping: 8, stiffness: 100 } });
      style = {
        opacity: Math.min(1, frame / 10),
        transform: `scale(${s})`,
      };
      break;
    }
    case "flipInX":
      style = {
        opacity: progress,
        transform: `perspective(400px) rotateX(${interpolate(progress, [0, 1], [90, 0])}deg)`,
      };
      break;
    case "fadeInUp":
      style = {
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [50, 0])}px)`,
      };
      break;
  }

  return <div style={style}>{children}</div>;
};

// サンプル1: BounceIn アニメーション
export const BounceInSample: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a2e",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animation duration={60} type="bounceIn">
        <span
          style={{
            fontSize: 90,
            fontWeight: "bold",
            color: "#ffffff",
            fontFamily: "Noto Sans JP, sans-serif",
          }}
        >
          バウンスイン！
        </span>
      </Animation>
    </AbsoluteFill>
  );
};

// サンプル2: FlipInX アニメーション
export const FlipInXSample: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#2d132c",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animation duration={50} type="flipInX">
        <span
          style={{
            fontSize: 85,
            fontWeight: "bold",
            color: "#ffd700",
            fontFamily: "Noto Sans JP, sans-serif",
          }}
        >
          フリップで登場
        </span>
      </Animation>
    </AbsoluteFill>
  );
};

// サンプル3: 連続アニメーション（歌詞風）
export const LyricSequence: React.FC = () => {
  const lyrics = [
    { text: "夢を見ていた", start: 0 },
    { text: "遠い空の下", start: 60 },
    { text: "君と出会った", start: 120 },
    { text: "あの日のこと", start: 180 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0d0d0d",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {lyrics.map((lyric, index) => (
        <Sequence key={index} from={lyric.start} durationInFrames={75}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Animation duration={30} type="fadeInUp">
              <span
                style={{
                  fontSize: 70,
                  fontWeight: "bold",
                  color: "#ffffff",
                  fontFamily: "Noto Sans JP, sans-serif",
                  textShadow: "0 0 20px rgba(255,255,255,0.5)",
                }}
              >
                {lyric.text}
              </span>
            </Animation>
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
