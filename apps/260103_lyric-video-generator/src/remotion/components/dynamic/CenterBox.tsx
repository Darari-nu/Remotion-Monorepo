import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CenterBoxProps {
  startFrame?: number;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  maxScale?: number;
}

export const CenterBox: React.FC<CenterBoxProps> = ({
  startFrame = 0,
  color = 'rgba(255, 255, 255, 0.9)',
  borderColor = '#000000',
  borderWidth = 4,
  maxScale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring animation for scale
  const scale = spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: 20,
      stiffness: 80,
    },
  });

  // Don't render before start
  if (frame < startFrame) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale * maxScale})`,
        width: '600px',
        height: '400px',
        backgroundColor: color,
        border: `${borderWidth}px solid ${borderColor}`,
        opacity: scale,
      }}
    />
  );
};
