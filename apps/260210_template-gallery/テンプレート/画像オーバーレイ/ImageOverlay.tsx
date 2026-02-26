import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  Img,
  interpolate,
  random,
  Easing,
} from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

// ===========================================
// Zodスキーマ定義（Remotion Studio用）
// ===========================================
export const imageOverlaySchema = z.object({
  backgroundImage: z.string().optional(),
  showImage: z.boolean().default(true).describe("背景画像を表示"),
  imageOpacity: z.number().min(0).max(1).step(0.01).default(1).describe("画像の透明度"),
  backgroundColor: zColor().default('#000000').describe("背景色"),
  effectType: z.enum(['goldDust', 'auraPulse', 'floatingSparkle', 'lensFlare', 'mistGlow', 'petalSparkle', 'etherealBlossom']),
  // アニメーション設定
  intensity: z.number().min(0).max(1).step(0.01).default(0.7).describe("エフェクト強度"),
  speed: z.number().min(0.1).max(5).step(0.01).default(1).describe("速度"),
  particleCount: z.number().min(10).max(500).step(10).default(50).describe("パーティクル数"),
});

// ===========================================
// 共通型定義 (Schemaから自動生成)
// ===========================================
export type ImageOverlayProps = z.infer<typeof imageOverlaySchema> & {
  colorPalette?: string[]; // Schemaにないがコンポーネントで使用されているため追加
};

// ===========================================
// 1. GoldDustShower - ゴールドダスト・シャワー
// ===========================================
interface GoldDustParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
  swayAmplitude: number;
  swayFrequency: number;
}

const GoldDustShower: React.FC<{
  intensity: number;
  speed: number;
  colors: string[];
  particleCount: number;
}> = ({ intensity, speed, colors, particleCount }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const particles: GoldDustParticle[] = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: random(`gold-x-${i}`) * width,
      y: random(`gold-y-${i}`) * height * 2 - height,
      size: 2 + random(`gold-size-${i}`) * 6,
      speed: 0.5 + random(`gold-speed-${i}`) * 1.5,
      opacity: 0.3 + random(`gold-opacity-${i}`) * 0.7,
      twinklePhase: random(`gold-twinkle-${i}`) * Math.PI * 2,
      twinkleSpeed: 0.05 + random(`gold-twinkle-speed-${i}`) * 0.1,
      swayAmplitude: 10 + random(`gold-sway-amp-${i}`) * 30,
      swayFrequency: 0.02 + random(`gold-sway-freq-${i}`) * 0.03,
    }));
  }, [particleCount, width, height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p) => {
        const fallProgress = (frame * p.speed * speed) % (height + 100);
        const y = (p.y + fallProgress) % (height + 100) - 50;
        const x = p.x + Math.sin(frame * p.swayFrequency + p.id) * p.swayAmplitude;
        const twinkle = 0.5 + Math.sin(frame * p.twinkleSpeed + p.twinklePhase) * 0.5;
        const color = colors[p.id % colors.length];

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: p.opacity * twinkle * intensity,
              boxShadow: `0 0 ${p.size * 2}px ${color}, 0 0 ${p.size * 4}px ${color}`,
              filter: `blur(${p.size < 4 ? 1 : 0}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

// ===========================================
// 2. AuraPulse - オーラ・パルス
// ===========================================
const AuraPulse: React.FC<{
  intensity: number;
  speed: number;
  colors: string[];
  centerX?: number;
  centerY?: number;
}> = ({ intensity, speed, colors, centerX = 0.5, centerY = 0.6 }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const pulseCount = 3;
  const pulseDuration = fps * 3; // 3秒周期

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: pulseCount }, (_, i) => {
        const offset = (i / pulseCount) * pulseDuration;
        const progress = ((frame + offset) % pulseDuration) / pulseDuration;
        const scale = interpolate(progress, [0, 1], [0, 3], {
          easing: Easing.out(Easing.quad),
        });
        const opacity = interpolate(progress, [0, 0.3, 1], [0, intensity * 0.6, 0], {
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: width * centerX,
              top: height * centerY,
              width: 200,
              height: 200,
              marginLeft: -100,
              marginTop: -100,
              borderRadius: '50%',
              background: `radial-gradient(ellipse, ${colors[i % colors.length]}40 0%, transparent 70%)`,
              transform: `scale(${scale})`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

// ===========================================
// 3. FloatingSparkle - フローティング・スパークル
// ===========================================
interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  phase: number;
  floatSpeed: number;
  floatAmplitude: number;
  twinkleSpeed: number;
  baseOpacity: number;
}

const FloatingSparkle: React.FC<{
  intensity: number;
  speed: number;
  colors: string[];
  particleCount: number;
}> = ({ intensity, speed, colors, particleCount }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const sparkles: SparkleParticle[] = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: random(`sparkle-x-${i}`) * width,
      y: random(`sparkle-y-${i}`) * height,
      size: 3 + random(`sparkle-size-${i}`) * 8,
      phase: random(`sparkle-phase-${i}`) * Math.PI * 2,
      floatSpeed: 0.01 + random(`sparkle-float-${i}`) * 0.02,
      floatAmplitude: 20 + random(`sparkle-amp-${i}`) * 40,
      twinkleSpeed: 0.08 + random(`sparkle-twinkle-${i}`) * 0.15,
      baseOpacity: 0.4 + random(`sparkle-opacity-${i}`) * 0.6,
    }));
  }, [particleCount, width, height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {sparkles.map((s) => {
        const floatY = Math.sin(frame * s.floatSpeed * speed + s.phase) * s.floatAmplitude;
        const floatX = Math.cos(frame * s.floatSpeed * speed * 0.7 + s.phase) * s.floatAmplitude * 0.5;
        const twinkle = Math.pow(Math.sin(frame * s.twinkleSpeed + s.phase), 2);
        const color = colors[s.id % colors.length];

        // 星形のキラキラ
        const starOpacity = twinkle > 0.8 ? 1 : twinkle * 0.5;

        return (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              left: s.x + floatX,
              top: s.y + floatY,
              width: s.size,
              height: s.size,
              opacity: s.baseOpacity * starOpacity * intensity,
            }}
          >
            {/* 4方向の光芒 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(0deg, transparent 40%, ${color} 50%, transparent 60%),
                             linear-gradient(90deg, transparent 40%, ${color} 50%, transparent 60%)`,
                transform: `scale(${1 + twinkle * 2})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(45deg, transparent 40%, ${color} 50%, transparent 60%),
                             linear-gradient(135deg, transparent 40%, ${color} 50%, transparent 60%)`,
                transform: `scale(${1 + twinkle * 1.5})`,
                opacity: 0.7,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

// ===========================================
// 4. LensFlare - レンズフレア
// ===========================================
const LensFlare: React.FC<{
  intensity: number;
  speed: number;
  colors: string[];
  sourceX?: number;
  sourceY?: number;
}> = ({ intensity, speed, colors, sourceX = 0.7, sourceY = 0.3 }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const cycleDuration = fps * 8; // 8秒周期
  const progress = (frame % cycleDuration) / cycleDuration;

  // フレアの位置がゆっくり移動
  const flareX = interpolate(progress, [0, 0.5, 1], [sourceX - 0.1, sourceX + 0.1, sourceX - 0.1]);
  const flareY = interpolate(progress, [0, 0.5, 1], [sourceY - 0.05, sourceY + 0.05, sourceY - 0.05]);

  const flareElements = [
    { size: 300, offset: 0, opacity: 0.3, color: colors[0] },
    { size: 150, offset: 0.2, opacity: 0.2, color: colors[1] || colors[0] },
    { size: 80, offset: 0.4, opacity: 0.4, color: colors[2] || colors[0] },
    { size: 40, offset: 0.6, opacity: 0.3, color: colors[1] || colors[0] },
    { size: 120, offset: 0.8, opacity: 0.15, color: colors[0] },
  ];

  // 光源から対角線上にフレアを配置
  const centerX = width / 2;
  const centerY = height / 2;
  const srcX = width * flareX;
  const srcY = height * flareY;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* メイン光源 */}
      <div
        style={{
          position: 'absolute',
          left: srcX,
          top: srcY,
          width: 100,
          height: 100,
          marginLeft: -50,
          marginTop: -50,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors[0]}80 0%, transparent 70%)`,
          opacity: intensity,
          filter: 'blur(20px)',
        }}
      />

      {/* アナモルフィックストリーク */}
      <div
        style={{
          position: 'absolute',
          left: srcX,
          top: srcY,
          width: 600,
          height: 4,
          marginLeft: -300,
          marginTop: -2,
          background: `linear-gradient(90deg, transparent, ${colors[0]}60, ${colors[0]}80, ${colors[0]}60, transparent)`,
          opacity: intensity * 0.7,
          filter: 'blur(2px)',
        }}
      />

      {/* フレアゴースト */}
      {flareElements.map((el, i) => {
        const x = srcX + (centerX - srcX) * el.offset * 2;
        const y = srcY + (centerY - srcY) * el.offset * 2;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: el.size,
              height: el.size,
              marginLeft: -el.size / 2,
              marginTop: -el.size / 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${el.color}40 0%, transparent 70%)`,
              opacity: el.opacity * intensity,
              filter: 'blur(10px)',
            }}
          />
        );
      })}
    </div>
  );
};

// ===========================================
// 5. MistGlow - ミスト・グロウ
// ===========================================
const MistGlow: React.FC<{
  intensity: number;
  speed: number;
  colors: string[];
}> = ({ intensity, speed, colors }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const layers = [
    { yOffset: 0.7, scale: 1, opacity: 0.4, phase: 0 },
    { yOffset: 0.8, scale: 1.2, opacity: 0.3, phase: Math.PI / 3 },
    { yOffset: 0.9, scale: 0.8, opacity: 0.5, phase: Math.PI / 2 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {layers.map((layer, i) => {
        const wave = Math.sin(frame * 0.02 * speed + layer.phase) * 30;
        const color = colors[i % colors.length];

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: -100,
              right: -100,
              top: height * layer.yOffset + wave,
              height: 300 * layer.scale,
              background: `linear-gradient(to top, ${color}00 0%, ${color}60 50%, ${color}00 100%)`,
              opacity: layer.opacity * intensity,
              filter: 'blur(40px)',
              transform: `scaleY(${1 + Math.sin(frame * 0.015 * speed + layer.phase) * 0.2})`,
            }}
          />
        );
      })}
    </div>
  );
};

// ===========================================
// 6. PetalSparkle - 花びら＋スパークル複合
// ===========================================
interface Petal {
  id: number;
  x: number;
  y: number;
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

const PetalSparkle: React.FC<{
  intensity: number;
  speed: number;
  colors: string[];
  particleCount: number;
}> = ({ intensity, speed, colors, particleCount }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const petals: Petal[] = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: random(`petal-x-${i}`) * width,
      y: random(`petal-y-${i}`) * height * 2 - height,
      size: 10 + random(`petal-size-${i}`) * 15,
      rotation: random(`petal-rot-${i}`) * 360,
      rotationSpeed: 0.5 + random(`petal-rot-speed-${i}`) * 2,
      fallSpeed: 0.3 + random(`petal-fall-${i}`) * 0.7,
      swayAmplitude: 20 + random(`petal-sway-${i}`) * 50,
      swayFrequency: 0.01 + random(`petal-sway-freq-${i}`) * 0.02,
      phase: random(`petal-phase-${i}`) * Math.PI * 2,
      color: colors[Math.floor(random(`petal-color-${i}`) * colors.length)],
      opacity: 0.4 + random(`petal-opacity-${i}`) * 0.4,
    }));
  }, [particleCount, width, height, colors]);

  // スパークルも追加
  const sparkleCount = Math.floor(particleCount / 3);
  const sparkles = React.useMemo(() => {
    return Array.from({ length: sparkleCount }, (_, i) => ({
      id: i,
      x: random(`ps-sparkle-x-${i}`) * width,
      y: random(`ps-sparkle-y-${i}`) * height,
      size: 4 + random(`ps-sparkle-size-${i}`) * 6,
      twinkleSpeed: 0.1 + random(`ps-sparkle-twinkle-${i}`) * 0.2,
      phase: random(`ps-sparkle-phase-${i}`) * Math.PI * 2,
    }));
  }, [sparkleCount, width, height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* 花びら */}
      {petals.map((p) => {
        const fallProgress = (frame * p.fallSpeed * speed) % (height + p.size * 2);
        const y = (p.y + fallProgress) % (height + p.size * 2) - p.size;
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
        const floatY = Math.sin(frame * 0.02 + s.phase) * 20;

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

// ===========================================
// 7. EtherealBlossom - 幻想的な花（Organic Flutter）
// ===========================================
interface EtherealParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  // 3軸回転
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  // 回転速度
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  // 揺らぎ用
  swayFreq1: number;
  swayFreq2: number;
  swayAmp1: number;
  swayAmp2: number;
  phase: number;
  fallSpeedBase: number;
  color: string;
  opacity: number;
}

const EtherealBlossom: React.FC<{
  intensity: number;
  speed: number;
  colors: string[];
  particleCount: number;
}> = ({ intensity, speed, colors, particleCount }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // ループ化のロジック:
  // 全ての周期的パラメータ（回転、揺れ、移動）が「durationInFrames」の間に
  // ちょうど「整数回」のサイクルを完了するように速度を調整する。

  const particles: EtherealParticle[] = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const size = 8 + random(`eth-size-${i}`) * 12;
      const totalH = height + size * 2;

      // 自由な速度設定 (量子化なし)
      const fallSpeed = (0.5 + random(`eth-loops-${i}`) * 1.0) * speed * 2;

      // 回転速度 (量子化なし)
      const genRotSpeed = (seed: string) => {
        return (random(seed) - 0.5) * 4 * speed * 20;
      };

      // 揺れの周波数 (量子化なし)
      const genSwayFreq = (seed: string, minObs: number, maxObs: number) => {
        return (minObs + random(seed) * (maxObs - minObs)) * speed * 0.05;
      };

      return {
        id: i,
        x: random(`eth-x-${i}`) * width,
        y: random(`eth-y-${i}`) * totalH - size,
        size,
        rotationX: random(`eth-rx-${i}`) * 360,
        rotationY: random(`eth-ry-${i}`) * 360,
        rotationZ: random(`eth-rz-${i}`) * 360,
        rotSpeedX: genRotSpeed(`eth-rsx-${i}`),
        rotSpeedY: genRotSpeed(`eth-rsy-${i}`),
        rotSpeedZ: genRotSpeed(`eth-rz-${i}`),
        swayFreq1: genSwayFreq(`eth-sf1-${i}`, 1, 3),
        swayFreq2: genSwayFreq(`eth-sf2-${i}`, 2, 5),
        swayAmp1: 30 + random(`eth-sa1-${i}`) * 50,
        swayAmp2: 10 + random(`eth-sa2-${i}`) * 20,
        phase: random(`eth-phase-${i}`) * Math.PI * 2,
        fallSpeedBase: fallSpeed,
        color: colors[Math.floor(random(`eth-color-${i}`) * colors.length)],
        opacity: 0.4 + random(`eth-op-${i}`) * 0.5,
      };
    });
  }, [particleCount, width, height, colors, speed]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p) => {
        // 時間経過
        const t = frame;

        // 3軸回転
        const rx = p.rotationX + t * p.rotSpeedX;
        const ry = p.rotationY + t * p.rotSpeedY;
        const rz = p.rotationZ + t * p.rotSpeedZ;

        const totalHeight = height + p.size * 2;
        const fallProgress = (t * p.fallSpeedBase);
        let y = (p.y + fallProgress) % totalHeight;
        y -= p.size;

        // 複合波形による揺らぎ
        const sway =
          Math.sin(t * p.swayFreq1 + p.phase) * p.swayAmp1 +
          Math.cos(t * p.swayFreq2 + p.phase) * p.swayAmp2;

        const x = p.x + sway;

        // フェード処理
        const progress = frame / durationInFrames;
        const fade = Math.sin(Math.PI * progress);

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: '50% 0 50% 50%', // 花びら形状
              opacity: p.opacity * intensity * fade, // フェード適用
              transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
              boxShadow: `0 0 ${p.size / 2}px ${p.color}80`, // ブルーム効果
              filter: `blur(${Math.abs(sway) * 0.05}px)`, // 動きに合わせたモーションブラー風
            }}
          />
        );
      })}
    </div>
  );
};

// ===========================================
// 8. BokehBubbles - ボケのある泡（Rising Bubbles）
// ===========================================
interface BokehParticle {
  id: number;
  initialX: number;
  initialY: number;
  size: number;
  speed: number;
  frequency: number;
  amplitude: number;
  phase: number;
  color: string;
  opacity: number;
  borderRadius: string;
  blur: number;
  scale: number;
}

const BokehBubbles: React.FC<{
  speed: number;
  colors: string[];
  count?: number;
}> = ({ speed, colors, count = 30 }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const bubbles: BokehParticle[] = React.useMemo(() => {
    // カフェ風のカラーパレット
    const bubbleColors = [
      '#FFD700', // Gold
      '#FFB6C1', // LightPink
      '#FFFACD', // LemonChiffon
      '#DEB887', // Burlywood
      '#D2691E', // Chocolate
      ...colors,
    ];

    return Array.from({ length: count }, (_, i) => {
      // 深度（スケール）をランダムに決定: 0.5 (奥) ~ 2.5 (手前)
      const scale = 0.5 + random(`bokeh-scale-${i}`) * 2.0;
      const sizeBase = 20 + random(`bokeh-size-${i}`) * 100;
      const actualSize = sizeBase * scale;
      const totalH = height + actualSize;

      const distFromFocus = Math.abs(scale - 1.2);
      const blur = distFromFocus > 0.5 ? 2 + distFromFocus * 4 : 0;

      // 速度設定: 5秒ループの制約をなくすため量子化を廃止
      // speed=1で0.3~1.0の範囲になるように調整
      const baseRiseSpeed = (0.3 + random(`bokeh-speed-${i}`) * 0.7) * speed * 2;

      // 周波数設定
      const frequency = (0.005 + random(`bokeh-freq-${i}`) * 0.01) * speed;

      return {
        id: i,
        initialX: random(`bokeh-x-${i}`) * width,
        initialY: random(`bokeh-y-${i}`) * totalH,
        size: actualSize,
        speed: baseRiseSpeed,
        frequency,
        amplitude: 10 + random(`bokeh-amp-${i}`) * 40,
        phase: random(`bokeh-phase-${i}`) * Math.PI * 2,
        color: bubbleColors[Math.floor(random(`bokeh-color-${i}`) * bubbleColors.length)],
        opacity: 0.3 + random(`bokeh-op-${i}`) * 0.4,
        borderRadius: `${35 + random(`bokeh-radius-${i}`) * 15}%`,
        blur,
        scale,
      };
    });
  }, [count, width, height, speed, colors, durationInFrames]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {bubbles.map((b) => {
        // Y軸: 上昇
        const totalHeight = height + b.size;
        const moveY = frame * b.speed;
        let y = (b.initialY - moveY) % totalHeight;
        if (y < -b.size) {
          y += totalHeight;
        }

        // X軸: 揺らぎ
        const x = b.initialX + Math.sin(frame * b.frequency + b.phase) * b.amplitude;

        // フェードループ処理: 0sと5s(duration)で透明にする
        const progress = frame / durationInFrames;
        const fade = Math.sin(Math.PI * progress);

        return (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: b.size,
              height: b.size,
              backgroundColor: b.color,
              borderRadius: b.borderRadius,
              opacity: b.opacity * fade, // フェード適用
              filter: `blur(${b.blur}px)`,
              transform: `scale(${1})`,
              mixBlendMode: 'screen', // 光が重なる感じ
            }}
          />
        );
      })}
    </div>
  );
};

// ===========================================
// メインコンポーネント
// ===========================================
export const ImageOverlay: React.FC<ImageOverlayProps> = ({
  backgroundImage,
  effectType,
  intensity = 0.7,
  speed = 1,
  colorPalette,
  particleCount = 50,
  showImage = true,
  imageOpacity = 1,
  backgroundColor = '#000000',
}) => {
  const { width, height } = useVideoConfig();

  // デフォルトカラーパレット
  const defaultColors: Record<string, string[]> = {
    goldDust: ['#FFD700', '#FFA500', '#FFEC8B', '#F4A460'],
    auraPulse: ['#FFD700', '#FFF8DC', '#FFEFD5'],
    floatingSparkle: ['#FFFFFF', '#FFFACD', '#FFE4B5', '#FFD700'],
    lensFlare: ['#FFD700', '#FFA500', '#FF8C00'],
    mistGlow: ['#FFE4C4', '#FFDAB9', '#FFE4B5'],
    petalSparkle: ['#FFB6C1', '#FF69B4', '#FFC0CB', '#DB7093', '#FFE4E1'],
    etherealBlossom: ['#FFB6C1', '#FFC0CB', '#FFF0F5', '#FFE4E1', '#E6E6FA'], // 淡く幻想的な色
  };

  const colors = colorPalette || defaultColors[effectType];

  const renderEffect = () => {
    switch (effectType) {
      case 'goldDust':
        return <GoldDustShower intensity={intensity} speed={speed} colors={colors} particleCount={particleCount} />;
      case 'auraPulse':
        return <AuraPulse intensity={intensity} speed={speed} colors={colors} />;
      case 'floatingSparkle':
        return <FloatingSparkle intensity={intensity} speed={speed} colors={colors} particleCount={particleCount} />;
      case 'lensFlare':
        return <LensFlare intensity={intensity} speed={speed} colors={colors} />;
      case 'mistGlow':
        return <MistGlow intensity={intensity} speed={speed} colors={colors} />;
      case 'petalSparkle':
        return <PetalSparkle intensity={intensity} speed={speed} colors={colors} particleCount={particleCount} />;
      case 'etherealBlossom':
        // 花びらとボケ泡を重ねる
        return (
          <>
            <BokehBubbles speed={speed} colors={colors} count={30} />
            <EtherealBlossom intensity={intensity} speed={speed} colors={colors} particleCount={particleCount} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: backgroundColor,
      }}
    >
      {/* 背景画像 */}
      {backgroundImage && showImage && (
        <Img
          src={backgroundImage}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageOpacity,
          }}
        />
      )}

      {/* エフェクトレイヤー */}
      {renderEffect()}
    </div>
  );
};

export default ImageOverlay;
