import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, staticFile, interpolate, Easing, random } from 'remotion';
import { z } from 'zod';

export const fallingTextPhysicsSchema = z.object({
  '📝 1行目': z.string().default("Crypto").describe('1行目の歌詞'),
  '📝 2行目': z.string().default("Ninja").describe('2行目の歌詞'),
  '📝 3行目': z.string().default("Coffee").describe('3行目の歌詞'),
  '📝 4行目': z.string().default("Time").describe('4行目の歌詞'),
  '🎨 文字色': z.array(z.string()).default(['#FF6B9D', '#00FFFF', '#FFD700', '#FF4500', '#7FFF00']).describe('文字の色パレット'),
  '🖼️ 背景色': z.string().default('#0a0a0a').describe('背景色'),
  '📏 フォントサイズ': z.number().min(30).max(200).step(1).default(55).describe('文字の大きさ'),
  '⏱️ 表示時間(ms)': z.number().min(300).max(3000).step(100).default(1000).describe('上部に表示する時間'),
  '💨 落下間隔(ms)': z.number().min(50).max(500).step(10).default(150).describe('文字を落とす間隔'),
  '🌍 重力': z.number().min(0.1).max(2).step(0.1).default(0.5).describe('重力の強さ'),
  '🏀 反発': z.number().min(0).max(1).step(0.05).default(0.5).describe('跳ね返り係数'),
  '✨ グロー': z.boolean().default(true).describe('グロー効果'),
  '🎬 登場アニメーション': z.boolean().default(true).describe('Kinetic風の登場アニメーション'),
  '⚡ 登場速度(frames)': z.number().min(5).max(30).step(1).default(15).describe('1文字の登場アニメーション時間'),
  '🎯 登場遅延(frames)': z.number().min(1).max(10).step(1).default(3).describe('文字ごとの遅延'),
});

interface Letter {
  char: string;
  initialX: number;
  initialY: number;
  color: string;
  index: number; // 文字のインデックス
}

export const FallingTextPhysics: React.FC<z.infer<typeof fallingTextPhysicsSchema>> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 4行の歌詞を結合
  const lines = [
    props['📝 1行目'],
    props['📝 2行目'],
    props['📝 3行目'],
    props['📝 4行目'],
  ].filter(line => line.trim() !== ''); // 空行は除外
  const lyric = lines.join('\n');

  const colors = props['🎨 文字色'];
  const backgroundColor = props['🖼️ 背景色'];
  const fontSize = props['📏 フォントサイズ'];
  const displayTimeMs = props['⏱️ 表示時間(ms)'];
  const dropIntervalMs = props['💨 落下間隔(ms)'];
  const gravity = props['🌍 重力'];
  const bounce = props['🏀 反発'];
  const glow = props['✨ グロー'];
  const kineticEnabled = props['🎬 登場アニメーション'];
  const kineticDuration = props['⚡ 登場速度(frames)'];
  const kineticStagger = props['🎯 登場遅延(frames)'];

  // ミリ秒をフレームに変換
  const displayFrames = Math.round((displayTimeMs / 1000) * fps);
  const dropIntervalFrames = Math.round((dropIntervalMs / 1000) * fps);

  // 文字の初期配置を計算（メモ化）
  const letters: Letter[] = useMemo(() => {
    const lines = lyric.split('\n');
    const result: Letter[] = [];
    let globalIndex = 0;

    lines.forEach((line, lineIndex) => {
      const chars = line.split('');
      // 文字間隔を広めに取る（フォントサイズの80%）
      const charSpacing = fontSize * 0.8;
      const lineWidth = chars.length * charSpacing;
      let currentX = (width - lineWidth) / 2 + (charSpacing / 2);
      // 行間も広めに（フォントサイズの150%）
      const y = height * 0.25 + (lineIndex * fontSize * 1.5);

      chars.forEach((char) => {
        const color = colors[globalIndex % colors.length];
        result.push({
          char,
          initialX: currentX,
          initialY: y,
          color,
          index: globalIndex,
        });
        currentX += charSpacing;
        globalIndex++;
      });
    });

    return result;
  }, [lyric, colors, fontSize, width, height]);

  // フェーズ管理
  const totalLetters = letters.length;
  const lastDropFrame = displayFrames + (totalLetters - 1) * dropIntervalFrames;

  // 各文字の現在位置・状態を計算（衝突検出のため全体をシミュレーション）
  const currentLetters = useMemo(() => {
    // 全文字の状態を初期化
    interface LetterState {
      char: string;
      color: string;
      index: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      dropStartFrame: number;
      opacity: number;
    }

    const states: LetterState[] = letters.map((letter) => {
      const seed = letter.index * 9999;
      const random = (n: number) => ((seed + n * 7919) % 10000) / 10000;

      return {
        char: letter.char,
        color: letter.color,
        index: letter.index,
        x: letter.initialX,
        y: letter.initialY,
        vx: (random(1) - 0.5) * 3, // 初期横速度
        vy: 0,
        rotation: 0,
        rotationSpeed: (random(2) - 0.5) * 0.1,
        dropStartFrame: displayFrames + letter.index * dropIntervalFrames,
        opacity: 1,
      };
    });

    // フレーム0から現在フレームまでシミュレーション
    for (let simFrame = 0; simFrame <= frame; simFrame++) {
      states.forEach((state) => {
        // 表示フェーズまたは落下前
        if (simFrame < state.dropStartFrame) {
          return; // この文字はまだ動かない
        }

        // 落下中
        // 重力
        state.vy += gravity;

        // 速度を適用
        state.x += state.vx;
        state.y += state.vy;
        state.rotation += state.rotationSpeed;

        // 摩擦（空気抵抗）
        state.vx *= 0.98;

        // 地面との衝突
        const ground = height - fontSize / 2;
        if (state.y > ground) {
          state.y = ground;
          state.vy *= -bounce; // バウンド
          state.rotationSpeed *= bounce;

          // ほぼ停止したら完全に止める
          if (Math.abs(state.vy) < 0.5) {
            state.vy = 0;
            state.rotationSpeed *= 0.5;
          }
        }

        // 壁との衝突
        if (state.x < fontSize / 2) {
          state.x = fontSize / 2;
          state.vx *= -bounce;
        }
        if (state.x > width - fontSize / 2) {
          state.x = width - fontSize / 2;
          state.vx *= -bounce;
        }
      });

      // 文字同士の衝突検出（落下中の文字のみ）
      for (let i = 0; i < states.length; i++) {
        const stateA = states[i];
        if (simFrame < stateA.dropStartFrame) continue; // まだ落下していない

        for (let j = i + 1; j < states.length; j++) {
          const stateB = states[j];
          if (simFrame < stateB.dropStartFrame) continue; // まだ落下していない

          const dx = stateB.x - stateA.x;
          const dy = stateB.y - stateA.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = fontSize * 0.8;

          if (dist < minDist && dist > 0) {
            // 衝突！押し出す
            const angle = Math.atan2(dy, dx);
            const overlap = minDist - dist;

            stateA.x -= Math.cos(angle) * overlap * 0.5;
            stateA.y -= Math.sin(angle) * overlap * 0.5;
            stateB.x += Math.cos(angle) * overlap * 0.5;
            stateB.y += Math.sin(angle) * overlap * 0.5;

            // 速度の交換（簡易版）
            const tempVx = stateA.vx;
            const tempVy = stateA.vy;
            stateA.vx = stateB.vx * 0.5;
            stateA.vy = stateB.vy * 0.5;
            stateB.vx = tempVx * 0.5;
            stateB.vy = tempVy * 0.5;
          }
        }
      }
    }

    return states;
  }, [frame, letters, displayFrames, dropIntervalFrames, gravity, bounce, fontSize, height, width]);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <style>
        {`
          @font-face {
            font-family: 'Nagayama Kai';
            src: url('${staticFile('nagayama_kai08.otf')}') format('opentype');
          }
        `}
      </style>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <defs>
          {glow && (
            <filter id="glow-falling">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}

          {/* Kinetic用のクリップパス定義 */}
          {currentLetters.map((letter, i) => {
            if (!kineticEnabled || frame >= displayFrames) return null;

            const seed = `falling-${letter.index}`;
            const charDelay = letter.index * kineticStagger;
            const sharpEase = Easing.bezier(0.87, 0, 0.13, 1);
            const rawProgress = interpolate(
              frame - charDelay,
              [0, kineticDuration],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const progress = sharpEase(rawProgress);

            const modes = [
              'box-expand',      // 四角
              'circle-ring',     // ⚪︎リング
              'hexagon-expand',  // 六角形
              'octagon-expand',  // 八角形
              'triangle-expand', // 三角
              'diamond-rotate'   // ダイヤモンド回転
            ] as const;
            const randomModeIndex = Math.floor(random(seed) * modes.length);
            const charMode = modes[randomModeIndex];

            const clipId = `clip-${letter.index}`;

            if (charMode === 'box-expand') {
              const ins = interpolate(progress, [0, 1], [0.5, 0]);
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <rect x={ins} y={ins} width={1 - ins * 2} height={1 - ins * 2} />
                </clipPath>
              );
            } else if (charMode === 'circle-ring') {
              // リング: 外側の円 - 内側の円
              const outerR = interpolate(progress, [0, 1], [0, 0.9]);
              const innerR = interpolate(progress, [0, 0.5, 1], [0, 0, 0.8]);
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <circle cx="0.5" cy="0.5" r={outerR} />
                  <circle cx="0.5" cy="0.5" r={innerR} fill="black" />
                </clipPath>
              );
            } else if (charMode === 'cross-expand') {
              const p = interpolate(progress, [0, 1], [0, 0.9]);
              const w = 0.2; // 十字の幅
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <rect x={0.5 - w / 2} y={0.5 - p} width={w} height={p * 2} />
                  <rect x={0.5 - p} y={0.5 - w / 2} width={p * 2} height={w} />
                </clipPath>
              );
            } else if (charMode === 'star-expand') {
              const p = interpolate(progress, [0, 1], [0, 0.8]);
              // 5角星
              const points = [];
              for (let i = 0; i < 5; i++) {
                const angle = (i * 72 - 90) * Math.PI / 180;
                points.push(`${0.5 + Math.cos(angle) * p},${0.5 + Math.sin(angle) * p}`);
                const innerAngle = ((i + 0.5) * 72 - 90) * Math.PI / 180;
                points.push(`${0.5 + Math.cos(innerAngle) * p * 0.4},${0.5 + Math.sin(innerAngle) * p * 0.4}`);
              }
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <polygon points={points.join(' ')} />
                </clipPath>
              );
            } else if (charMode === 'diamond-rotate') {
              const p = interpolate(progress, [0, 1], [0, 0.9]);
              const rotation = interpolate(progress, [0, 1], [0, 180]);
              // ひし形（45度回転した正方形）
              const transform = `rotate(${rotation} 0.5 0.5)`;
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <polygon
                    points={`0.5,${0.5 - p} ${0.5 + p},0.5 0.5,${0.5 + p} ${0.5 - p},0.5`}
                    transform={transform}
                  />
                </clipPath>
              );
            } else if (charMode === 'hexagon-expand') {
              const p = interpolate(progress, [0, 1], [0, 0.8]);
              // 六角形 (flat-top)
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <polygon points={`${0.5 - p * 0.43},${0.5 - p * 0.5} ${0.5 + p * 0.43},${0.5 - p * 0.5} ${0.5 + p * 0.87},0.5 ${0.5 + p * 0.43},${0.5 + p * 0.5} ${0.5 - p * 0.43},${0.5 + p * 0.5} ${0.5 - p * 0.87},0.5`} />
                </clipPath>
              );
            } else if (charMode === 'octagon-expand') {
              const p = interpolate(progress, [0, 1], [0, 0.8]);
              const d = p * 0.71; // cos(45°)
              const e = p * 0.29; // (1-cos(45°))/2 adjusted
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <polygon points={`${0.5 - e},${0.5 - d} ${0.5 + e},${0.5 - d} ${0.5 + d},${0.5 - e} ${0.5 + d},${0.5 + e} ${0.5 + e},${0.5 + d} ${0.5 - e},${0.5 + d} ${0.5 - d},${0.5 + e} ${0.5 - d},${0.5 - e}`} />
                </clipPath>
              );
            } else if (charMode === 'triangle-expand') {
              const p = interpolate(progress, [0, 1], [0, 0.9]);
              return (
                <clipPath key={clipId} id={clipId} clipPathUnits="objectBoundingBox">
                  <polygon points={`0.5,${0.5 - p * 0.87} ${0.5 + p},${0.5 + p * 0.5} ${0.5 - p},${0.5 + p * 0.5}`} />
                </clipPath>
              );
            }

            return null;
          })}
        </defs>

        {currentLetters.map((letter, i) => {
          // Kinetic登場アニメーション（表示フェーズ中のみ）
          let kineticTransform = '';
          let kineticOpacity = 1;
          let clipPathUrl = '';
          let shapeElement = null;

          if (kineticEnabled && frame < displayFrames) {
            const seed = `falling-${letter.index}`;
            const charDelay = letter.index * kineticStagger;

            // アニメーション進行度
            const sharpEase = Easing.bezier(0.87, 0, 0.13, 1);
            const rawProgress = interpolate(
              frame - charDelay,
              [0, kineticDuration],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const progress = sharpEase(rawProgress);

            // モード取得
            const modes = [
              'box-expand',      // 四角
              'circle-ring',     // ⚪︎リング
              'hexagon-expand',  // 六角形
              'octagon-expand',  // 八角形
              'triangle-expand', // 三角
              'diamond-rotate'   // ダイヤモンド回転
            ] as const;
            const randomModeIndex = Math.floor(random(seed) * modes.length);
            const charMode = modes[randomModeIndex];

            // クリップパスを参照（アニメーション中のみ）
            if (rawProgress > 0 && rawProgress < 1) {
              clipPathUrl = `url(#clip-${letter.index})`;
            }

            // まだ登場していない場合は非表示
            if (rawProgress <= 0) {
              kineticOpacity = 0;
            }

            // 図形を描画（アニメーション中のみ）
            if (rawProgress > 0 && rawProgress < 1) {
              const shapeOpacity = interpolate(rawProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
              const accentColor = '#808080'; // グレー

              if (charMode === 'box-expand') {
                const ins = interpolate(progress, [0, 1], [0.5, 0]);
                const boxOpacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
                shapeElement = (
                  <rect
                    x={letter.x - fontSize / 2 + ins * fontSize}
                    y={letter.y - fontSize / 2 + ins * fontSize}
                    width={(1 - ins * 2) * fontSize}
                    height={(1 - ins * 2) * fontSize}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={5}
                    opacity={boxOpacity}
                  />
                );
              } else if (charMode === 'circle-ring') {
                // リング: 塗りつぶし円が拡大し、内側から消える
                const outerR = interpolate(progress, [0, 1], [0, 0.9]);
                const innerR = interpolate(progress, [0, 0.5, 1], [0, 0, 0.8]);
                const ringOpacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

                shapeElement = (
                  <g>
                    <circle
                      cx={letter.x}
                      cy={letter.y}
                      r={outerR * fontSize / 2}
                      fill={accentColor}
                      opacity={ringOpacity}
                    />
                    <circle
                      cx={letter.x}
                      cy={letter.y}
                      r={innerR * fontSize / 2}
                      fill={backgroundColor}
                      opacity={ringOpacity}
                    />
                  </g>
                );
              } else if (charMode === 'cross-expand') {
                const p = interpolate(progress, [0, 1], [0, 0.9]);
                const w = 0.2;
                const crossOpacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
                const radius = fontSize / 2;

                shapeElement = (
                  <g opacity={crossOpacity}>
                    <rect
                      x={letter.x - w * radius}
                      y={letter.y - p * radius}
                      width={w * radius * 2}
                      height={p * radius * 2}
                      fill={accentColor}
                    />
                    <rect
                      x={letter.x - p * radius}
                      y={letter.y - w * radius}
                      width={p * radius * 2}
                      height={w * radius * 2}
                      fill={accentColor}
                    />
                  </g>
                );
              } else if (charMode === 'star-expand') {
                const p = interpolate(progress, [0, 1], [0, 0.8]);
                const starOpacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
                const radius = fontSize / 2;
                const points = [];
                for (let i = 0; i < 5; i++) {
                  const angle = (i * 72 - 90) * Math.PI / 180;
                  points.push([letter.x + Math.cos(angle) * p * radius, letter.y + Math.sin(angle) * p * radius]);
                  const innerAngle = ((i + 0.5) * 72 - 90) * Math.PI / 180;
                  points.push([letter.x + Math.cos(innerAngle) * p * radius * 0.4, letter.y + Math.sin(innerAngle) * p * radius * 0.4]);
                }

                shapeElement = (
                  <polygon
                    points={points.map(pt => pt.join(',')).join(' ')}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={5}
                    opacity={starOpacity}
                  />
                );
              } else if (charMode === 'diamond-rotate') {
                const p = interpolate(progress, [0, 1], [0, 0.9]);
                const rotation = interpolate(progress, [0, 1], [0, 180]);
                const diamondOpacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
                const radius = fontSize / 2;

                shapeElement = (
                  <polygon
                    points={`${letter.x},${letter.y - p * radius} ${letter.x + p * radius},${letter.y} ${letter.x},${letter.y + p * radius} ${letter.x - p * radius},${letter.y}`}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={5}
                    opacity={diamondOpacity}
                    transform={`rotate(${rotation} ${letter.x} ${letter.y})`}
                  />
                );
              } else if (charMode === 'hexagon-expand') {
                const p = interpolate(progress, [0, 1], [0, 0.8]);
                const ringOpacity = interpolate(progress, [0.8, 1], [1, 0]);
                const radius = fontSize / 2;
                const points = [
                  [letter.x - p * radius * 0.43, letter.y - p * radius * 0.5],
                  [letter.x + p * radius * 0.43, letter.y - p * radius * 0.5],
                  [letter.x + p * radius * 0.87, letter.y],
                  [letter.x + p * radius * 0.43, letter.y + p * radius * 0.5],
                  [letter.x - p * radius * 0.43, letter.y + p * radius * 0.5],
                  [letter.x - p * radius * 0.87, letter.y]
                ].map(pt => pt.join(',')).join(' ');
                shapeElement = (
                  <polygon
                    points={points}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={5}
                    opacity={ringOpacity}
                  />
                );
              } else if (charMode === 'octagon-expand') {
                const p = interpolate(progress, [0, 1], [0, 0.8]);
                const ringOpacity = interpolate(progress, [0.8, 1], [1, 0]);
                const radius = fontSize / 2;
                const d = p * radius * 0.71;
                const e = p * radius * 0.29;
                const points = [
                  [letter.x - e, letter.y - d],
                  [letter.x + e, letter.y - d],
                  [letter.x + d, letter.y - e],
                  [letter.x + d, letter.y + e],
                  [letter.x + e, letter.y + d],
                  [letter.x - e, letter.y + d],
                  [letter.x - d, letter.y + e],
                  [letter.x - d, letter.y - e]
                ].map(pt => pt.join(',')).join(' ');
                shapeElement = (
                  <polygon
                    points={points}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={5}
                    opacity={ringOpacity}
                  />
                );
              } else if (charMode === 'triangle-expand') {
                const p = interpolate(progress, [0, 1], [0, 0.9]);
                const ringOpacity = interpolate(progress, [0.8, 1], [1, 0]);
                const radius = fontSize / 2;
                const points = [
                  [letter.x, letter.y - p * radius * 0.87],
                  [letter.x + p * radius, letter.y + p * radius * 0.5],
                  [letter.x - p * radius, letter.y + p * radius * 0.5]
                ].map(pt => pt.join(',')).join(' ');
                shapeElement = (
                  <polygon
                    points={points}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={5}
                    opacity={ringOpacity}
                  />
                );
              }
            }
          }

          return (
            <g key={i}>
              {shapeElement}
              <g clipPath={clipPathUrl}>
                <text
                  x={letter.x}
                  y={letter.y}
                  fill={letter.color}
                  fontSize={fontSize}
                  fontFamily="'Nagayama Kai', 'Noto Sans JP', sans-serif"
                  fontWeight="normal"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`${kineticTransform} rotate(${letter.rotation} ${letter.x} ${letter.y})`}
                  opacity={letter.opacity * kineticOpacity}
                  filter={glow ? 'url(#glow-falling)' : undefined}
                  style={{
                    paintOrder: 'stroke fill',
                  }}
                >
                  {letter.char}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
