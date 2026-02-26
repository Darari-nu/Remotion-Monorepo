import React from 'react';
import { interpolate, useCurrentFrame, Easing } from 'remotion';

interface SlashingBarsProps {
  startFrame?: number;
  endFrame?: number;
  color?: string;
  angle?: number;
  width?: number;
  speed?: number;
}

export const SlashingBars: React.FC<SlashingBarsProps> = ({
  startFrame = 40,
  endFrame = 55,
  color = '#000000',
  angle = -45,
  width = 200,
  speed = 1.5,
}) => {
  const frame = useCurrentFrame();

  // Only show during active frames
  if (frame < startFrame || frame > endFrame) {
    return null;
  }

  const relativeFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  // High-speed horizontal movement with easing
  const translateX = interpolate(
    relativeFrame,
    [0, duration],
    [-1500, 2000],
    {
      easing: Easing.bezier(0.33, 1, 0.68, 1),
      extrapolateRight: 'clamp',
    }
  );

  // Generate multiple bars for layered effect
  const bars = [
    { offset: 0, opacity: 1 },
    { offset: -150, opacity: 0.7 },
    { offset: 150, opacity: 0.7 },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {bars.map((bar, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${width}px`,
            height: '150%',
            backgroundColor: color,
            transform: `translateX(${translateX + bar.offset}px) translateY(-25%) rotate(${angle}deg)`,
            opacity: bar.opacity,
            left: '50%',
            top: '50%',
          }}
        />
      ))}
    </div>
  );
};
