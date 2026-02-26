import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
} from 'remotion';
import { Audio } from '@remotion/media';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';
import { BPMEffects } from './BPMSeamlessEffects';
import { BlinkingYui } from './BlinkingYui';

// レイヤー設定のスキーマ
const layerSchema = z.object({
  show: z.boolean().default(true).describe('表示/非表示'),
  opacity: z.number().min(0).max(1).step(0.01).default(1).describe('透明度'),
  x: z.number().min(-1000).max(1000).step(1).default(0).describe('X座標'),
  y: z.number().min(-1000).max(1000).step(1).default(0).describe('Y座標'),
  scale: z.number().min(0.1).max(3).step(0.01).default(1).describe('拡大・縮小'),
  rotation: z.number().min(-180).max(180).step(1).default(0).describe('回転角度'),
  blur: z.number().min(0).max(20).step(0.1).default(0).describe('ぼかし'),
  mixBlendMode: z.string().default('normal').describe('ブレンドモード'),
});

export const lifeIsmamagotoBPMSchema = z.object({
  '背景レイヤー': layerSchema,
  'Yuiレイヤー': layerSchema,
  '🌸 エフェクト強度': z.number().min(0).max(2).step(0.01).default(1).describe('キラキラの明るさ (1=標準)'),
  '⚡ エフェクト速度': z.number().min(0.1).max(5).step(0.01).default(1.23).describe('点滅・落下の速さ (遅くしたい→0.8, 速くしたい→2.0)'),
  '✨ パーティクル数': z.number().min(0).max(500).step(1).default(110).describe('花びら+キラキラの数'),
  '🎨 背景色': zColor().default('transparent'),
  '🎵 BPM': z.number().min(60).max(200).step(0.1).default(93).describe('音楽のテンポ (早く光る→数値を下げる, 遅く光る→数値を上げる)'),
  '💫 BPM同期の強度': z.number().min(0).max(2).step(0.01).default(1).describe('ビートでの光り方 (0=なし, 1=標準, 2=強)'),
  '⏱️ BPM同期オフセット': z.number().min(-300).max(300).step(1).default(0).describe('タイミング微調整 (早い→プラス, 遅い→マイナス)'),
  '📊 ビート表示': z.boolean().default(true).describe('タイミング確認用の棒を表示'),
});

export const LifeIsmamagotoBPM: React.FC<z.infer<typeof lifeIsmamagotoBPMSchema>> = (props) => {
  const bgLayer = props['背景レイヤー'];
  const yuiLayer = props['Yuiレイヤー'];
  const effectIntensity = props['🌸 エフェクト強度'];
  const effectSpeed = props['⚡ エフェクト速度'];
  const particleCount = props['✨ パーティクル数'];
  const backgroundColor = props['🎨 背景色'];
  const bpm = props['🎵 BPM'];
  const bpmSyncIntensity = props['💫 BPM同期の強度'];
  const bpmOffset = props['⏱️ BPM同期オフセット'];
  const showBeatIndicator = props['📊 ビート表示'];

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
            src={staticFile('Cafe_background2.png')}
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

      {/* Layer 3: 花びら＋キラキラアニメーション（キラキラのみBPM同期） */}
      <BPMEffects
        intensity={effectIntensity}
        speed={effectSpeed}
        particleCount={particleCount}
        bpm={bpm}
        bpmSyncIntensity={bpmSyncIntensity}
        bpmOffset={bpmOffset}
        showBeatIndicator={showBeatIndicator}
      />
    </AbsoluteFill>
  );
};
