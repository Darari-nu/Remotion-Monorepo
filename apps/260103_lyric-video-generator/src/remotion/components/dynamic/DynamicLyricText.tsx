import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface LyricCharProps {
  char: string;
  delay: number;
}

const LyricChar: React.FC<LyricCharProps> = ({ char, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spr = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 12,
      stiffness: 120,
    },
  });

  return (
    <span
      style={{
        display: 'inline-block',
        transform: `scale(${spr}) translateY(${(1 - spr) * 20}px)`,
        opacity: spr,
      }}
    >
      {char}
    </span>
  );
};

interface DynamicLyricTextProps {
  text: string;
  startFrame: number;
  charDelay?: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  writingMode?: 'horizontal-tb' | 'vertical-rl';
}

export const DynamicLyricText: React.FC<DynamicLyricTextProps> = ({
  text,
  startFrame,
  charDelay = 2,
  fontSize = 80,
  fontWeight = 'bold',
  color = '#000000',
  position = 'center',
  writingMode = 'horizontal-tb',
}) => {
  const frame = useCurrentFrame();

  // Don't render before start
  if (frame < startFrame) {
    return null;
  }

  const chars = text.split('');

  const positionStyles: Record<string, React.CSSProperties> = {
    center: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    top: {
      top: '15%',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    bottom: {
      bottom: '15%',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    left: {
      top: '50%',
      left: '10%',
      transform: 'translateY(-50%)',
    },
    right: {
      top: '50%',
      right: '10%',
      transform: 'translateY(-50%)',
    },
  };

  return (
    <div
      style={{
        position: 'absolute',
        fontSize: `${fontSize}px`,
        fontWeight,
        color,
        fontFamily: '"Noto Sans JP", sans-serif',
        writingMode,
        textOrientation: writingMode === 'vertical-rl' ? 'upright' : 'mixed',
        ...positionStyles[position],
      }}
    >
      {chars.map((char, i) => (
        <LyricChar key={i} char={char} delay={i * charDelay} />
      ))}
    </div>
  );
};
