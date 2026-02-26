import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface FocusLinesProps {
  numLines?: number;
  color?: string;
  opacity?: number;
  centerX?: number;
  centerY?: number;
  animationSpeed?: number;
}

export const FocusLines: React.FC<FocusLinesProps> = ({
  numLines = 24,
  color = '#e0e0e0',
  opacity = 0.4,
  centerX = 540,
  centerY = 960,
  animationSpeed = 30,
}) => {
  const frame = useCurrentFrame();

  // Generate random lines once
  const lines = useMemo(() => {
    return Array.from({ length: numLines }).map((_, i) => {
      const angle = (i / numLines) * Math.PI * 2;
      const length = 800 + Math.random() * 400;
      const thickness = 2 + Math.random() * 4;
      const offsetDistance = 100 + Math.random() * 200;

      return {
        angle,
        length,
        thickness,
        offsetDistance,
      };
    });
  }, [numLines]);

  // Periodic pulsing opacity
  const pulseOpacity = interpolate(
    frame % animationSpeed,
    [0, animationSpeed / 2, animationSpeed],
    [0, opacity, 0]
  );

  return (
    <svg
      width={1080}
      height={1920}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      {lines.map((line, i) => {
        const x1 = centerX + Math.cos(line.angle) * line.offsetDistance;
        const y1 = centerY + Math.sin(line.angle) * line.offsetDistance;
        const x2 = centerX + Math.cos(line.angle) * (line.offsetDistance + line.length);
        const y2 = centerY + Math.sin(line.angle) * (line.offsetDistance + line.length);

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={line.thickness}
            opacity={pulseOpacity}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};
