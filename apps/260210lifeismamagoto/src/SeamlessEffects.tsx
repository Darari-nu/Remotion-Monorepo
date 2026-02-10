import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  random,
} from 'remotion';

// ===========================================
// SeamlessPetalSparkle - シームレスループ対応版
// ===========================================
interface Petal {
  id: number;
  x: number;
  initialY: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  fallSpeed: number;
  swayAmplitude: number;
  swayFrequency: number;
  phase: number;
  color: string;
  opacity: number;
}

interface SeamlessPetalSparkleProps {
  intensity: number;
  speed: number;
  colors?: string[];
  particleCount: number;
}

export const SeamlessPetalSparkle: React.FC<SeamlessPetalSparkleProps> = ({
  intensity,
  speed,
  colors = ['#FFB6C1', '#FF69B4', '#FFC0CB', '#DB7093', '#FFE4E1'],
  particleCount,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const petals: Petal[] = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const size = 10 + random(`petal-size-${i}`) * 15;
      const totalHeight = height + size * 2;

      // 元の速度範囲を維持
      const desiredSpeed = 0.3 + random(`petal-fall-${i}`) * 0.7;

      // 可能なサイクル数（0.5刻み）
      const possibleCycles = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

      // 元の速度に最も近いサイクルを選択
      // 実際の速度 = (totalHeight × cycles) / (durationInFrames × speed)
      const targetSpeed = desiredSpeed;
      const idealCycles = (targetSpeed * durationInFrames * speed) / totalHeight;

      const closestCycle = possibleCycles.reduce((prev, curr) => {
        return Math.abs(curr - idealCycles) < Math.abs(prev - idealCycles) ? curr : prev;
      });

      // ループ対応の速度計算
      const quantizedFallSpeed = (totalHeight * closestCycle) / durationInFrames;

      return {
        id: i,
        x: random(`petal-x-${i}`) * width,
        initialY: random(`petal-y-${i}`) * totalHeight,
        size,
        rotation: random(`petal-rot-${i}`) * 360,
        rotationSpeed: 0.5 + random(`petal-rot-speed-${i}`) * 2,
        fallSpeed: quantizedFallSpeed,
        swayAmplitude: 20 + random(`petal-sway-${i}`) * 50,
        swayFrequency: 0.01 + random(`petal-sway-freq-${i}`) * 0.02,
        phase: random(`petal-phase-${i}`) * Math.PI * 2,
        color: colors[Math.floor(random(`petal-color-${i}`) * colors.length)],
        opacity: 0.4 + random(`petal-opacity-${i}`) * 0.4,
      };
    });
  }, [particleCount, width, height, colors, speed, durationInFrames]);

  // スパークル
  const sparkleCount = Math.floor(particleCount / 3);
  const sparkles = React.useMemo(() => {
    return Array.from({ length: sparkleCount }, (_, i) => ({
      id: i,
      x: random(`ps-sparkle-x-${i}`) * width,
      y: random(`ps-sparkle-y-${i}`) * height,
      size: 4 + random(`ps-sparkle-size-${i}`) * 6,
      // オリジナルと同じ速度: 0.1〜0.3
      twinkleSpeed: 0.1 + random(`ps-sparkle-twinkle-${i}`) * 0.2,
      phase: random(`ps-sparkle-phase-${i}`) * Math.PI * 2,
    }));
  }, [sparkleCount, width, height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* 花びら */}
      {petals.map((p) => {
        const totalHeight = height + p.size * 2;
        // ループ対応: speedを掛けて落下
        const fallProgress = (frame * p.fallSpeed * speed) % totalHeight;
        const y = (p.initialY + fallProgress) % totalHeight - p.size;
        const x = p.x + Math.sin(frame * p.swayFrequency + p.phase) * p.swayAmplitude;
        const rotation = p.rotation + frame * p.rotationSpeed * speed;
        const wobble = Math.sin(frame * 0.05 + p.phase) * 20;

        return (
          <div
            key={`petal-${p.id}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.size,
              height: p.size * 1.5,
              backgroundColor: p.color,
              borderRadius: '50% 0 50% 50%',
              transform: `rotate(${rotation}deg) rotateY(${wobble}deg)`,
              opacity: p.opacity * intensity,
              boxShadow: `0 0 ${p.size / 2}px ${p.color}40`,
            }}
          />
        );
      })}

      {/* スパークル */}
      {sparkles.map((s) => {
        const twinkle = Math.pow(Math.sin(frame * s.twinkleSpeed + s.phase), 4);
        const floatY = Math.sin(frame * 0.02 * speed + s.phase) * 20;

        return (
          <div
            key={`sparkle-${s.id}`}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y + floatY,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              backgroundColor: '#FFFACD',
              opacity: twinkle * intensity * 0.8,
              boxShadow: `0 0 ${s.size * 2}px #FFFACD, 0 0 ${s.size * 4}px #FFD700`,
            }}
          />
        );
      })}
    </div>
  );
};
