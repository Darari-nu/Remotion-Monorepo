import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
} from 'remotion';
import { Audio } from '@remotion/media';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';
import { SeamlessPetalSparkle } from './SeamlessEffects';
import { BlinkingYui } from './BlinkingYui';

// レイヤー設定のスキーマ
const layerSchema = z.object({
  show: z.boolean().default(true).describe('表示/非表示'),
  opacity: z.number().min(0).max(1).step(0.01).default(1).describe('透明度'),
  x: z.number().min(-1000).max(1000).step(1).default(0).describe('X座標'),
  y: z.number().min(-1000).max(1000).step(1).default(0).describe('Y座標'),
  scale: z.number().min(0.1).max(3).step(0.01).default(1).describe('拡大・縮小'),
  rotation: z.number().min(-360).max(360).step(1).default(0).describe('回転（度）'),
  blur: z.number().min(0).max(50).step(0.1).default(0).describe('ぼかし（px）'),
  mixBlendMode: z.enum(['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']).default('normal').describe('ブレンドモード'),
});

// コンポジション全体のスキーマ
export const lifeIsmamagotoSchema = z.object({
  // 背景レイヤー
  bgLayer: layerSchema.default({
    show: true,
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    blur: 0,
    mixBlendMode: 'normal',
  }).describe('背景画像レイヤー'),

  // Yuiレイヤー
  yuiLayer: layerSchema.default({
    show: true,
    opacity: 0.85,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    blur: 0,
    mixBlendMode: 'normal',
  }).describe('Yui画像レイヤー'),

  // エフェクト設定
  effectIntensity: z.number().min(0).max(1).step(0.01).default(1).describe('エフェクト強度'),
  effectSpeed: z.number().min(0.1).max(5).step(0.01).default(1.23).describe('エフェクト速度'),
  particleCount: z.number().min(10).max(1000).step(10).default(290).describe('パーティクル数'),
  backgroundColor: zColor().default('#ffffff').describe('背景色'),
});

export type LifeIsmamagotoProps = z.infer<typeof lifeIsmamagotoSchema>;

export const LifeIsmamagotoComposition: React.FC<LifeIsmamagotoProps> = ({
  bgLayer,
  yuiLayer,
  effectIntensity,
  effectSpeed,
  particleCount,
  backgroundColor,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Audio */}
      <Audio src={staticFile('Yui.wav')} />

      {/* Layer 1: カフェ背景画像（最下層） */}
      {bgLayer.show && (
        <AbsoluteFill
          style={{
            transform: `translate(${bgLayer.x}px, ${bgLayer.y}px) scale(${bgLayer.scale}) rotate(${bgLayer.rotation}deg)`,
            filter: `blur(${bgLayer.blur}px)`,
            mixBlendMode: bgLayer.mixBlendMode as any,
          }}
        >
          <Img
            src={staticFile('cafe_background.png')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: bgLayer.opacity,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Layer 2: Yui画像（中間レイヤー・瞬きあり） */}
      {yuiLayer.show && (
        <AbsoluteFill
          style={{
            transform: `translate(${yuiLayer.x}px, ${yuiLayer.y}px) scale(${yuiLayer.scale}) rotate(${yuiLayer.rotation}deg)`,
            filter: `blur(${yuiLayer.blur}px)`,
            mixBlendMode: yuiLayer.mixBlendMode as any,
          }}
        >
          <BlinkingYui
            x={yuiLayer.x}
            y={yuiLayer.y}
            scale={yuiLayer.scale}
            rotation={yuiLayer.rotation}
            blur={yuiLayer.blur}
            opacity={yuiLayer.opacity}
            mixBlendMode={yuiLayer.mixBlendMode}
          />
        </AbsoluteFill>
      )}

      {/* Layer 3: 花びら＋キラキラアニメーション（シームレスループ対応） */}
      <SeamlessPetalSparkle
        intensity={effectIntensity}
        speed={effectSpeed}
        particleCount={particleCount}
      />
    </AbsoluteFill>
  );
};
