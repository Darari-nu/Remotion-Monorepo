import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

// 自前の文字アニメーションコンポーネント
interface CharAnimationProps {
  text: string;
  delimiter?: string;
  startFrame?: number;
  staggerDelay?: number;
  animationDuration?: number;
  style?: React.CSSProperties;
  animationType?: "fadeIn" | "dropDown" | "bounce" | "rotateIn" | "wave";
}

const CharAnimation: React.FC<CharAnimationProps> = ({
  text,
  delimiter = "",
  startFrame = 0,
  staggerDelay = 3,
  animationDuration = 20,
  style = {},
  animationType = "fadeIn",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const parts = delimiter === "" ? text.split("") : text.split(delimiter);

  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", ...style }}>
      {parts.map((char, index) => {
        const charStartFrame = startFrame + index * staggerDelay;
        const progress = interpolate(
          frame,
          [charStartFrame, charStartFrame + animationDuration],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        let transform = "";
        let opacity = 1;

        switch (animationType) {
          case "fadeIn":
            opacity = progress;
            transform = `scale(${interpolate(progress, [0, 1], [0.5, 1])}) translateY(${interpolate(progress, [0, 1], [20, 0])}px)`;
            break;
          case "dropDown":
            opacity = progress;
            transform = `translateY(${interpolate(progress, [0, 1], [-100, 0])}px) rotate(${interpolate(progress, [0, 1], [180, 0])}deg)`;
            break;
          case "bounce":
            const bounceSpring = spring({
              frame: frame - charStartFrame,
              fps,
              config: { damping: 8, stiffness: 100 },
            });
            opacity = Math.min(1, (frame - charStartFrame) / 5);
            transform = `scale(${bounceSpring}) translateY(${interpolate(bounceSpring, [0, 1], [50, 0])}px)`;
            break;
          case "rotateIn":
            opacity = progress;
            transform = `rotate(${interpolate(progress, [0, 1], [-90, 0])}deg) scale(${interpolate(progress, [0, 1], [0.3, 1])}) translateX(${interpolate(progress, [0, 1], [-50, 0])}px)`;
            break;
          case "wave":
            opacity = progress;
            const waveOffset = Math.sin((frame - charStartFrame) * 0.3) * (1 - progress) * 10;
            transform = `translateY(${interpolate(progress, [0, 1], [30, 0]) + waveOffset}px) scale(${interpolate(progress, [0, 1], [0.8, 1])})`;
            break;
        }

        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              opacity,
              transform,
              whiteSpace: char === " " ? "pre" : undefined,
            }}
          >
            {char}
            {delimiter === " " && index < parts.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
};

// サンプル1: 文字ごとにフェードイン + スケール
export const CharacterFadeIn: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a2e",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CharAnimation
        text="夜空に輝く星のように"
        animationType="fadeIn"
        staggerDelay={4}
        animationDuration={25}
        style={{
          fontSize: 80,
          fontWeight: "bold",
          color: "#ffffff",
          fontFamily: "Noto Sans JP, sans-serif",
        }}
      />
    </AbsoluteFill>
  );
};

// サンプル2: 単語ごとに回転しながら登場
export const WordRotateIn: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#16213e",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CharAnimation
        text="Life is Beautiful Today"
        delimiter=" "
        animationType="rotateIn"
        staggerDelay={15}
        animationDuration={30}
        style={{
          fontSize: 72,
          fontWeight: "bold",
          color: "#e94560",
          fontFamily: "M PLUS Rounded 1c, sans-serif",
        }}
      />
    </AbsoluteFill>
  );
};

// サンプル3: 文字が上から降ってくる
export const CharacterDropDown: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f0f",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CharAnimation
        text="降り注ぐ光"
        animationType="dropDown"
        staggerDelay={5}
        animationDuration={20}
        style={{
          fontSize: 90,
          fontWeight: 900,
          color: "#00ff88",
          fontFamily: "Zen Maru Gothic, sans-serif",
          textShadow: "0 0 20px #00ff88",
        }}
      />
    </AbsoluteFill>
  );
};

// サンプル4: グラデーションテキスト + ウェーブ
export const GradientWave: React.FC = () => {
  const frame = useCurrentFrame();
  const hueShift = interpolate(frame, [0, 150], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: `linear-gradient(${hueShift}deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        <CharAnimation
          text="カラフルな世界へ"
          animationType="wave"
          staggerDelay={5}
          animationDuration={25}
          style={{
            fontSize: 85,
            fontWeight: "bold",
            fontFamily: "Noto Sans JP, sans-serif",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
