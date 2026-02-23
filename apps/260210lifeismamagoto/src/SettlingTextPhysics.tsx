import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { z } from 'zod';

// Zod schema for Studio controls
export const settlingTextPhysicsSchema = z.object({
  '📝 1行目': z.string().default("Crypto").describe('1行目の歌詞'),
  '📝 2行目': z.string().default("Ninja").describe('2行目の歌詞'),
  '📝 3行目': z.string().default("Coffee").describe('3行目の歌詞'),
  '📝 4行目': z.string().default("Time").describe('4行目の歌詞'),
  '🎨 文字色': z.array(z.string()).default(['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF']).describe('文字の色パレット'),
  '🖼️ 背景色': z.string().default('#0a0a0a').describe('背景色'),
  '📏 フォントサイズ': z.number().min(30).max(300).step(1).default(180).describe('文字の大きさ'),

  // 登場アニメーション
  '🎬 登場アニメーション': z.boolean().default(true).describe('Kinetic風の登場アニメーション'),
  '⚡ 登場速度(frames)': z.number().min(5).max(30).step(1).default(12).describe('1文字の登場アニメーション時間'),
  '🎯 登場遅延(frames)': z.number().min(1).max(10).step(1).default(2).describe('文字ごとの遅延'),
  '🎲 初期ランダム範囲X': z.number().min(0).max(1000).step(10).default(400).describe('X方向のランダムオフセット(px)'),
  '🎲 初期ランダム範囲Y': z.number().min(0).max(1000).step(10).default(300).describe('Y方向のランダムオフセット(px)'),

  // 物理演算
  '🌍 重力': z.number().min(0.1).max(5).step(0.1).default(2).describe('落下の重力'),
  '🏀 反発': z.number().min(0).max(1).step(0.05).default(0.3).describe('床・壁での反発係数'),
  '🧲 引力の強さ': z.number().min(0.1).max(2).step(0.1).default(0.5).describe('目標位置への引力'),
  '💨 減衰率': z.number().min(0.8).max(0.99).step(0.01).default(0.95).describe('速度の減衰'),
  '🎯 収束距離(px)': z.number().min(1).max(50).step(1).default(10).describe('この距離以下で収束判定'),

  '✨ グロー': z.boolean().default(false).describe('グロー効果'),
});

export type SettlingTextPhysicsProps = z.infer<typeof settlingTextPhysicsSchema>;

// シード付きランダム関数
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ベジェ曲線イージング
function cubicBezier(t: number, p1: number, p2: number): number {
  const cx = 3 * p1;
  const bx = 3 * (p2 - p1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1;
  const by = 3 * (p2 - p1) - cy;
  const ay = 1 - cy - by;

  function sampleCurveX(t: number) {
    return ((ax * t + bx) * t + cx) * t;
  }

  function sampleCurveY(t: number) {
    return ((ay * t + by) * t + cy) * t;
  }

  function solveCurveX(x: number) {
    let t0, t1, t2, x2, d2, i;
    for (t2 = x, i = 0; i < 8; i++) {
      x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < 0.000001) return t2;
      d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
      if (Math.abs(d2) < 0.000001) break;
      t2 = t2 - x2 / d2;
    }

    t0 = 0;
    t1 = 1;
    t2 = x;

    if (t2 < t0) return t0;
    if (t2 > t1) return t1;

    while (t0 < t1) {
      x2 = sampleCurveX(t2);
      if (Math.abs(x2 - x) < 0.000001) return t2;
      if (x < x2) t1 = t2;
      else t0 = t2;
      t2 = (t1 - t0) * 0.5 + t0;
    }

    return t2;
  }

  return sampleCurveY(solveCurveX(t));
}

const easeOutBack = (t: number) => cubicBezier(t, 0.34, 1.56);

export const SettlingTextPhysics: React.FC<SettlingTextPhysicsProps> = ({
  '📝 1行目': line1,
  '📝 2行目': line2,
  '📝 3行目': line3,
  '📝 4行目': line4,
  '🎨 文字色': colorPalette,
  '🖼️ 背景色': backgroundColor,
  '📏 フォントサイズ': fontSize,
  '🎬 登場アニメーション': enableEntrance,
  '⚡ 登場速度(frames)': entranceDuration,
  '🎯 登場遅延(frames)': entranceStagger,
  '🎲 初期ランダム範囲X': randomRangeX,
  '🎲 初期ランダム範囲Y': randomRangeY,
  '🌍 重力': gravity,
  '🏀 反発': bounce,
  '🧲 引力の強さ': attractionForce,
  '💨 減衰率': damping,
  '🎯 収束距離(px)': settlementThreshold,
  '✨ グロー': enableGlow,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // テキストを行に分割して文字配列を作成
  const lines = [line1, line2, line3, line4].filter(l => l.trim().length > 0);

  const letters = useMemo(() => {
    const result: Array<{
      char: string;
      lineIndex: number;
      charIndexInLine: number;
      globalIndex: number;
      targetX: number;
      targetY: number;
      color: string;
    }> = [];

    let globalIndex = 0;
    const lineHeight = fontSize * 1.5;
    const totalHeight = lines.length * lineHeight;
    const startY = (height - totalHeight) / 2;

    lines.forEach((line, lineIndex) => {
      const chars = line.split('');
      const charSpacing = fontSize * 0.6; // 文字間隔
      const lineWidth = chars.length * charSpacing;
      const startX = (width - lineWidth) / 2;

      chars.forEach((char, charIndexInLine) => {
        const targetX = startX + charIndexInLine * charSpacing + charSpacing / 2;
        const targetY = startY + lineIndex * lineHeight + fontSize / 2;
        const color = colorPalette[globalIndex % colorPalette.length];

        result.push({
          char,
          lineIndex,
          charIndexInLine,
          globalIndex,
          targetX,
          targetY,
          color,
        });

        globalIndex++;
      });
    });

    return result;
  }, [lines, fontSize, width, height, colorPalette]);

  // 物理シミュレーション
  const physicsStates = useMemo(() => {
    const states = letters.map((letter, idx) => {
      const seed = letter.globalIndex * 1234.56789;

      // 画面全体からランダムに出現
      const initialX = seededRandom(seed) * width;
      const initialY = seededRandom(seed + 1) * height;

      // 初期速度（X方向は控えめ）
      const initialVx = (seededRandom(seed + 2) - 0.5) * 3; // -1.5 ~ 1.5
      const initialVy = (seededRandom(seed + 3) - 0.5) * 4; // -2 ~ 2

      // バウンド回数をランダムに（1〜2回）
      const totalBounces = 1 + Math.floor(seededRandom(seed + 5) * 2); // 1, 2

      return {
        index: letter.globalIndex,
        initialX,
        initialY,
        targetX: letter.targetX,
        targetY: letter.targetY,
        x: initialX,
        y: initialY,
        vx: initialVx,
        vy: initialVy,
        rotation: (seededRandom(seed + 6) - 0.5) * 60, // 初期回転角度
        vr: (seededRandom(seed + 3) - 0.5) * 10, // 初期回転速度
        settled: false,
        bounceCount: 0, // 現在のバウンド回数
        totalBounces, // 目標バウンド回数
        entranceStartFrame: letter.globalIndex * entranceStagger,
        mode: ['box-expand', 'circle-ring', 'hexagon-expand', 'octagon-expand', 'triangle-expand', 'diamond-rotate'][
          Math.floor(seededRandom(seed + 4) * 6)
        ],
      };
    });

    // フレームごとにシミュレーション
    for (let simFrame = 0; simFrame <= frame; simFrame++) {
      states.forEach((state) => {
        if (state.settled) return;

        const entranceEndFrame = state.entranceStartFrame + entranceDuration;

        // 登場アニメーション有効時のみ、アニメーション中は物理演算しない
        if (enableEntrance && simFrame <= entranceEndFrame) {
          return;
        }

        const isLastBounce = state.bounceCount >= state.totalBounces - 1;
        const isAfterLastBounce = state.bounceCount >= state.totalBounces;

        if (isAfterLastBounce) {
          // 最後のバウンド後: 減衰なし、重力+速度だけで正確に到達
          state.vy += gravity;
          state.x += state.vx;
          state.y += state.vy;
          state.rotation += state.vr;

          // 上昇が終わった → 固定
          if (state.vy >= 0) {
            state.x = state.targetX;
            state.y = state.targetY;
            state.vx = 0;
            state.vy = 0;
            state.vr = 0;
            state.rotation = 0;
            state.settled = true;
          }
        } else {
          // バウンド前/途中: 通常の物理演算
          state.vy += gravity;
          state.x += state.vx;
          state.y += state.vy;
          state.rotation += state.vr;
          state.vr *= 0.95;

          // 床との衝突（画面一番下）
          const floor = height - fontSize * 0.3;
          if (state.y >= floor) {
            state.y = floor;
            state.bounceCount++;

            if (isLastBounce) {
              // 最後のバウンド: X, Y, θ全て正確に計算
              const distanceToTarget = floor - state.targetY;

              if (distanceToTarget > 0) {
                const requiredVelocity = Math.sqrt(2 * gravity * distanceToTarget);
                // 頂点到達までのフレーム数: t = v / g
                const framesToTarget = Math.ceil(requiredVelocity / gravity);

                state.vy = -requiredVelocity;

                // X: framesToTarget フレームで目標Xに到達
                const dx = state.targetX - state.x;
                state.vx = dx / framesToTarget;

                // θ: framesToTarget フレームで回転0に到達
                state.vr = -state.rotation / framesToTarget;
              } else {
                state.x = state.targetX;
                state.y = state.targetY;
                state.vx = 0;
                state.vy = 0;
                state.rotation = 0;
                state.settled = true;
              }
            } else {
              // 途中のバウンド
              const distanceToTarget = floor - state.targetY;
              const bounceRatio = 0.3 + (0.5 * state.bounceCount / state.totalBounces);
              const bounceHeight = distanceToTarget * bounceRatio;

              if (bounceHeight > 0) {
                const bounceVelocity = Math.sqrt(2 * gravity * bounceHeight);
                state.vy = -bounceVelocity;
              } else {
                state.vy *= -bounce;
              }

              // X方向も目標に少しずつ近づく
              const dx = state.targetX - state.x;
              state.vx = dx * 0.05;
              state.vr = state.vx * 0.02;
            }
          }

          // 左右の壁との衝突
          const leftWall = fontSize * 0.3;
          const rightWall = width - fontSize * 0.3;
          if (state.x < leftWall) {
            state.x = leftWall;
            state.vx *= -bounce;
          }
          if (state.x > rightWall) {
            state.x = rightWall;
            state.vx *= -bounce;
          }
        }
      });
    }

    return states;
  }, [letters, frame, width, height, fontSize, gravity, bounce, attractionForce, damping, settlementThreshold, entranceDuration, entranceStagger, randomRangeX, randomRangeY]);

  // アニメーションモード別のclipPath定義
  const modes = ['box-expand', 'circle-ring', 'hexagon-expand', 'octagon-expand', 'triangle-expand', 'diamond-rotate'] as const;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <style>
        {`
          @font-face {
            font-family: 'NagayamaKai';
            src: url('${staticFile('nagayama_kai08.otf')}') format('opentype');
          }
        `}
      </style>

      <svg width={width} height={height} style={{ position: 'absolute' }}>
        <defs>
          {physicsStates.map((state) => {
            const mode = state.mode;
            const clipId = `clip-settling-${state.index}`;

            if (mode === 'box-expand') {
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <rect x="0.1" y="0.1" width="0.8" height="0.8" />
                </clipPath>
              );
            } else if (mode === 'circle-ring') {
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <circle cx="0.5" cy="0.5" r="0.45" />
                  <circle cx="0.5" cy="0.5" r="0.2" fill="black" />
                </clipPath>
              );
            } else if (mode === 'hexagon-expand') {
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <polygon points="0.5,0.05 0.95,0.3 0.95,0.7 0.5,0.95 0.05,0.7 0.05,0.3" />
                </clipPath>
              );
            } else if (mode === 'octagon-expand') {
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <polygon points="0.3,0.05 0.7,0.05 0.95,0.3 0.95,0.7 0.7,0.95 0.3,0.95 0.05,0.7 0.05,0.3" />
                </clipPath>
              );
            } else if (mode === 'triangle-expand') {
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <polygon points="0.5,0.05 0.95,0.85 0.05,0.85" />
                </clipPath>
              );
            } else if (mode === 'diamond-rotate') {
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <polygon points="0.5,0.05 0.95,0.5 0.5,0.95 0.05,0.5" />
                </clipPath>
              );
            }
            return null;
          })}
        </defs>
      </svg>

      {letters.map((letter, idx) => {
        const state = physicsStates[idx];
        const entranceEndFrame = state.entranceStartFrame + entranceDuration;

        // 登場アニメーション進行度
        let entranceProgress = 0;
        if (enableEntrance && frame >= state.entranceStartFrame && frame < entranceEndFrame) {
          const relativeFrame = frame - state.entranceStartFrame;
          const rawProgress = relativeFrame / entranceDuration;
          entranceProgress = easeOutBack(Math.min(rawProgress, 1));
        } else if (frame >= entranceEndFrame) {
          entranceProgress = 1;
        }

        // 登場前は非表示
        if (frame < state.entranceStartFrame) {
          return null;
        }

        // 登場アニメーション中はランダム位置、終了後は物理演算位置
        const displayX = frame < entranceEndFrame ? state.initialX : state.x;
        const displayY = frame < entranceEndFrame ? state.initialY : state.y;
        const displayRotation = frame < entranceEndFrame ? 0 : state.rotation;

        // clipPath適用（登場アニメーション中のみ）
        let clipPathUrl = '';
        if (enableEntrance && entranceProgress > 0 && entranceProgress < 1) {
          clipPathUrl = `url(#clip-settling-${state.index})`;
        }

        return (
          <div
            key={`${letter.lineIndex}-${letter.charIndexInLine}`}
            style={{
              position: 'absolute',
              left: displayX,
              top: displayY,
              fontSize,
              fontFamily: 'NagayamaKai, sans-serif',
              fontWeight: 'bold',
              color: letter.color,
              transform: `translate(-50%, -50%) rotate(${displayRotation}deg) scale(${entranceProgress})`,
              opacity: entranceProgress,
              textShadow: enableGlow ? `0 0 20px ${letter.color}` : 'none',
              clipPath: clipPathUrl,
              WebkitClipPath: clipPathUrl,
            }}
          >
            {letter.char}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
