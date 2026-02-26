import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
  random,
} from 'remotion';
import { z } from 'zod';

// ===========================================
// Zodスキーマ定義（Remotion Studio用）
// ===========================================

// 個別レイヤーのスキーマ
const layerSchema = z.object({
  show: z.boolean().default(true).describe("表示する"),
  x: z.number().min(-1000).max(1000).step(1).default(0).describe("横位置"),
  y: z.number().min(-1000).max(1000).step(1).default(0).describe("縦位置"),
  scale: z.number().min(0.1).max(3).step(0.01).default(1).describe("大きさ"),
  opacity: z.number().min(0).max(1).step(0.01).default(1).describe("透明度"),
});

export const multiLayerOverlaySchema = z.object({
  // 背景色
  backgroundColor: z.string().default('#ffffff').describe("背景色"),

  // レイヤー3: Cafe（最背面）
  cafeLayer: layerSchema.default({
    show: true,
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
  }).describe("カフェ画像（奥）"),

  // レイヤー2: Yui（中間）
  yuiLayer: layerSchema.default({
    show: true,
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
  }).describe("Yui画像（中間）"),

  // レイヤー1: Flower（最前面）
  flowerLayer: layerSchema.default({
    show: true,
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
  }).describe("花サークル（手前）"),

  // 花サークル回転設定
  flowerRotationSpeed: z.number().min(-10).max(10).step(0.1).default(0).describe("花サークル回転速度"),

  // エフェクト1（奥・ぼかし）設定
  effect1Intensity: z.number().min(0).max(1).step(0.01).default(0.8).describe("奥の花びら濃さ"),
  effect1Speed: z.number().min(0.1).max(5).step(0.01).default(1).describe("奥の花びら速度"),
  effect1Count: z.number().min(0).max(500).step(10).default(150).describe("奥の花びら数"),
  effect1Blur: z.number().min(0).max(10).step(0.5).default(3).describe("奥のぼかし"),

  // エフェクト2（手前・薄め）設定
  effect2Intensity: z.number().min(0).max(1).step(0.01).default(0.3).describe("手前の花びら濃さ"),
  effect2Speed: z.number().min(0.1).max(5).step(0.01).default(1.5).describe("手前の花びら速度"),
  effect2Count: z.number().min(0).max(500).step(10).default(80).describe("手前の花びら数"),
  effect2CenterFade: z.number().min(0).max(1).step(0.01).default(0.7).describe("中央で薄くなる強さ"),
  effect2CenterRadius: z.number().min(0).max(500).step(10).default(200).describe("中央エリアの半径"),
});

export type MultiLayerOverlayProps = z.infer<typeof multiLayerOverlaySchema>;

// ===========================================
// PetalSparkle エフェクト（ImageOverlayから流用）
// ===========================================
interface PetalParticle {
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
  type: 'petal' | 'sparkle';
}

const PetalSparkleEffect: React.FC<{
  intensity: number;
  speed: number;
  particleCount: number;
  blur?: number; // ぼかし量（奥行き演出用）
  seedPrefix?: string; // 異なるパーティクル配置用
  centerFade?: number; // 中央で薄くなる強さ（0=無効、1=完全に透明）
  centerRadius?: number; // 中央エリアの半径（ピクセル）
}> = ({ intensity, speed, particleCount, blur = 0, seedPrefix = '', centerFade = 0, centerRadius = 200 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const colors = ['#FFB6C1', '#FF69B4', '#FFC0CB', '#DB7093', '#FFE4E1'];

  const particles: PetalParticle[] = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const isPetal = random(`${seedPrefix}petal-type-${i}`) > 0.3;
      return {
        id: i,
        x: random(`${seedPrefix}petal-x-${i}`) * width,
        y: random(`${seedPrefix}petal-y-${i}`) * height * 2 - height,
        size: isPetal ? 8 + random(`${seedPrefix}petal-size-${i}`) * 12 : 2 + random(`${seedPrefix}sparkle-size-${i}`) * 4,
        rotation: random(`${seedPrefix}petal-rot-${i}`) * 360,
        rotationSpeed: (random(`${seedPrefix}petal-rotspeed-${i}`) - 0.5) * 4 * speed,
        fallSpeed: (0.5 + random(`${seedPrefix}petal-fall-${i}`) * 1.5) * speed,
        swayAmplitude: 20 + random(`${seedPrefix}petal-sway-${i}`) * 40,
        swayFrequency: 0.02 + random(`${seedPrefix}petal-freq-${i}`) * 0.03,
        phase: random(`${seedPrefix}petal-phase-${i}`) * Math.PI * 2,
        color: colors[Math.floor(random(`${seedPrefix}petal-color-${i}`) * colors.length)],
        opacity: 0.4 + random(`${seedPrefix}petal-op-${i}`) * 0.5,
        type: isPetal ? 'petal' : 'sparkle',
      };
    });
  }, [particleCount, width, height, speed, seedPrefix]);

  // 中央座標
  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', filter: blur > 0 ? `blur(${blur}px)` : undefined }}>
      {particles.map((p) => {
        const totalHeight = height + p.size * 2;
        const fallProgress = frame * p.fallSpeed;
        let y = (p.y + fallProgress) % totalHeight;
        if (y < -p.size) y += totalHeight;

        const sway = Math.sin(frame * p.swayFrequency + p.phase) * p.swayAmplitude;
        const x = p.x + sway;
        const rotation = p.rotation + frame * p.rotationSpeed;

        // 中央からの距離を計算してフェード適用
        let centerFadeMultiplier = 1;
        if (centerFade > 0 && centerRadius > 0) {
          const distFromCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          );
          if (distFromCenter < centerRadius) {
            // 中央に近いほど透明になる（滑らかなグラデーション）
            const fadeRatio = 1 - (distFromCenter / centerRadius);
            centerFadeMultiplier = 1 - (fadeRatio * centerFade);
          }
        }

        if (p.type === 'sparkle') {
          const twinkle = 0.5 + Math.sin(frame * 0.2 + p.phase) * 0.5;
          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: p.size,
                height: p.size,
                backgroundColor: '#FFFFFF',
                borderRadius: '50%',
                opacity: p.opacity * intensity * twinkle * centerFadeMultiplier,
                boxShadow: `0 0 ${p.size * 2}px ${p.size}px rgba(255,255,255,0.5)`,
              }}
            />
          );
        }

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.size,
              height: p.size * 0.6,
              backgroundColor: p.color,
              borderRadius: '50% 0 50% 50%',
              opacity: p.opacity * intensity * centerFadeMultiplier,
              transform: `rotate(${rotation}deg)`,
              boxShadow: `0 0 ${p.size / 2}px ${p.color}80`,
            }}
          />
        );
      })}
    </div>
  );
};

// ===========================================
// 画像レイヤーコンポーネント
// ===========================================
interface ImageLayerProps {
  src: string;
  show: boolean;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotation?: number; // 回転角度（度）
}

const ImageLayer: React.FC<ImageLayerProps> = ({ src, show, x, y, scale, opacity, rotation = 0 }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
      }}
    >
      <Img
        src={src}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          opacity,
        }}
      />
    </div>
  );
};

// ===========================================
// メインコンポーネント
// ===========================================
export const MultiLayerOverlay: React.FC<MultiLayerOverlayProps> = ({
  backgroundColor = '#ffffff',
  cafeLayer,
  yuiLayer,
  flowerLayer,
  flowerRotationSpeed = 0,
  effect1Intensity = 0.8,
  effect1Speed = 1,
  effect1Count = 150,
  effect1Blur = 3,
  effect2Intensity = 0.3,
  effect2Speed = 1.5,
  effect2Count = 80,
  effect2CenterFade = 0.7,
  effect2CenterRadius = 200,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 花サークルの回転角度を計算
  const flowerRotation = frame * flowerRotationSpeed;

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor,
      }}
    >
      {/* レイヤー5: Cafe（最背面） */}
      <ImageLayer
        src={staticFile('cafe.png')}
        show={cafeLayer.show}
        x={cafeLayer.x}
        y={cafeLayer.y}
        scale={cafeLayer.scale}
        opacity={cafeLayer.opacity}
      />

      {/* レイヤー4: 花びらエフェクト1（奥・ぼかし） */}
      {effect1Count > 0 && (
        <PetalSparkleEffect
          intensity={effect1Intensity}
          speed={effect1Speed}
          particleCount={effect1Count}
          blur={effect1Blur}
          seedPrefix="back-"
        />
      )}

      {/* レイヤー3: Yui */}
      <ImageLayer
        src={staticFile('Yui222.png')}
        show={yuiLayer.show}
        x={yuiLayer.x}
        y={yuiLayer.y}
        scale={yuiLayer.scale}
        opacity={yuiLayer.opacity}
      />

      {/* レイヤー2: Flower（回転あり） */}
      <ImageLayer
        src={staticFile('flowerサークル.png')}
        show={flowerLayer.show}
        x={flowerLayer.x}
        y={flowerLayer.y}
        scale={flowerLayer.scale}
        opacity={flowerLayer.opacity}
        rotation={flowerRotation}
      />

      {/* レイヤー1: 花びらエフェクト2（最前面・中央フェード） */}
      {effect2Count > 0 && (
        <PetalSparkleEffect
          intensity={effect2Intensity}
          speed={effect2Speed}
          particleCount={effect2Count}
          seedPrefix="front-"
          centerFade={effect2CenterFade}
          centerRadius={effect2CenterRadius}
        />
      )}
    </div>
  );
};
