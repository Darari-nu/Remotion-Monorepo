import { interpolate, useCurrentFrame } from "remotion";
import React from "react";

export interface HopAnimationParams {
  hopHeight?: number;
  hopDuration?: number;
  staggerDelay?: number;
  bounceEffect?: boolean;
  rotation?: number;
  scale?: number;
  color?: string;
  highlightColor?: string;
}

interface HopCharProps {
  char: string;
  index: number;
  startFrame: number;
  params: HopAnimationParams;
}

const HopChar: React.FC<HopCharProps> = ({
  char,
  index,
  startFrame,
  params,
}) => {
  const frame = useCurrentFrame();

  const {
    hopHeight = 60,
    hopDuration = 20,
    staggerDelay = 3,
    bounceEffect = true,
    rotation = 0,
    scale = 1.2,
    color = "#ffffff",
    highlightColor = "#ffcc00",
  } = params;

  const charStartFrame = startFrame + index * staggerDelay;
  const charEndFrame = charStartFrame + hopDuration;

  const progress = interpolate(
    frame,
    [charStartFrame, charEndFrame],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  let hopProgress = Math.sin(progress * Math.PI);

  if (bounceEffect && progress > 0.5) {
    const bounceProgress = (progress - 0.5) * 2;
    hopProgress += Math.sin(bounceProgress * Math.PI) * 0.3;
  }

  const yOffset = -hopHeight * hopProgress;

  const scaleValue = interpolate(
    progress,
    [0, 0.5, 1],
    [1, scale, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const rotateValue = interpolate(
    progress,
    [0, 0.5, 1],
    [0, rotation, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const colorProgress = interpolate(
    progress,
    [0, 0.5, 1],
    [0, 1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const currentColor = colorProgress > 0.3 ? highlightColor : color;

  const opacity = interpolate(
    frame,
    [charStartFrame - 5, charStartFrame],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  return (
    <span
      style={{
        display: "inline-block",
        transform: `translateY(${yOffset}px) scale(${scaleValue}) rotate(${rotateValue}deg)`,
        color: currentColor,
        opacity,
        fontWeight: colorProgress > 0.3 ? "bold" : "normal",
        textShadow:
          colorProgress > 0.3
            ? `0 0 20px ${highlightColor}, 0 0 10px ${highlightColor}`
            : "none",
      }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  );
};

export const HopAnimation: React.FC<{
  text: string;
  startFrame: number;
  params?: HopAnimationParams;
}> = ({ text, startFrame, params = {} }) => {
  const chars = text.split("");

  return (
    <div style={{ display: "inline-block" }}>
      {chars.map((char, index) => (
        <HopChar
          key={index}
          char={char}
          index={index}
          startFrame={startFrame}
          params={params}
        />
      ))}
    </div>
  );
};
