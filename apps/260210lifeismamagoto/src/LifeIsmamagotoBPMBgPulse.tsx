import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from 'remotion';
import { Audio } from '@remotion/media';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';
import { BPMEffects } from './BPMSeamlessEffects';
import { BlinkingYui } from './BlinkingYui';
import { SettlingTextPhysics } from './SettlingTextPhysics';

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

export const lifeIsmamagotoBPMBgPulseSchema = z.object({
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
  '🌟 背景パルス強度': z.number().min(0).max(1).step(0.01).default(0.05).describe('背景の明るくなる強さ (0=なし, 0.05=とても控えめ, 0.08=控えめ, 0.15=標準)'),
  '🖼️ 背景画像を表示': z.boolean().default(true).describe('カフェ背景画像の表示'),
  '👩 Yuiを表示': z.boolean().default(true).describe('Yuiキャラクターの表示'),
  '🌸 花びらを表示': z.boolean().default(true).describe('花びらアニメーションの表示'),
  '✨ キラキラを表示': z.boolean().default(true).describe('キラキラアニメーションの表示'),
  '📝 テキストを表示': z.boolean().default(true).describe('収束テキストアニメーションの表示'),
});

export const LifeIsmamagotoBPMBgPulse: React.FC<z.infer<typeof lifeIsmamagotoBPMBgPulseSchema>> = (props) => {
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
  const bgPulseIntensity = props['🌟 背景パルス強度'];
  const showBgImage = props['🖼️ 背景画像を表示'];
  const showYui = props['👩 Yuiを表示'];
  const showPetals = props['🌸 花びらを表示'];
  const showSparkles = props['✨ キラキラを表示'];
  const showText = props['📝 テキストを表示'];

  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // フェードアウト設定
  const fadeOutStartFrame = Math.round(51 * fps); // 00:51 から開始（2秒早く）
  const fadeOutDuration = Math.round(5 * fps); // 5秒かけてゆっくりフェードアウト
  const settlingTextStartFrame = Math.round(54 * fps); // 54秒あたりからテキストアニメーション開始

  // フェードアウト計算
  // 背景: 完全にフェードアウト
  const mainFadeOpacity = interpolate(
    frame,
    [fadeOutStartFrame, fadeOutStartFrame + fadeOutDuration],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  // Yui: 完全には消えず、うっすら残す（opacity 0.15で残留）
  const yuiFadeOpacity = interpolate(
    frame,
    [fadeOutStartFrame, fadeOutStartFrame + fadeOutDuration],
    [1, 0.15],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  // 黒背景: 半透明（0.85）で止めてYuiが透けて見える
  const blackBgOpacity = interpolate(
    frame,
    [fadeOutStartFrame, fadeOutStartFrame + fadeOutDuration],
    [0, 0.85],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 花びらフェードアウト設定（01:00.00から）
  const petalFadeStartFrame = Math.round(60 * fps);
  const petalFadeDuration = Math.round(3 * fps); // 3秒かけてフェードアウト
  const petalFadeOpacity = interpolate(
    frame,
    [petalFadeStartFrame, petalFadeStartFrame + petalFadeDuration],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // サビのタイムライン設定（BPMSeamlessEffectsと同じ）
  const chorus1Start = 21 * fps; // 00:21:00
  const chorus1End = 37.21 * fps; // 00:37:21
  const chorus2Start = 42 * fps; // 00:42:00
  const chorus2End = durationInFrames; // ラストまで

  // サビかどうかを判定
  const isChorus = (frame >= chorus1Start && frame <= chorus1End) || (frame >= chorus2Start && frame <= chorus2End);

  // BPM計算（BPMSeamlessEffectsと同じロジック）
  const adjustedFrame = Math.max(0, frame - bpmOffset);
  const framesPerBeat = (60 / bpm) * fps;
  const beatProgress = (adjustedFrame % framesPerBeat) / framesPerBeat;

  // ビートに合わせたパルス効果（背景用・サビのときだけ）
  const pulseEffect = interpolate(
    beatProgress,
    [0, 0.1, 0.3, 1],
    [0, 1, 0.2, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor }}>

      {/* Layer 0: 黒背景（最下層・フェードアウト時に見える） */}
      <AbsoluteFill style={{ backgroundColor: '#000000' }} />

      {/* Audio */}
      <Audio src={staticFile('Yui.wav')} />

      {/* Layer 1: カフェ背景画像（最下層） */}
      {bgLayer.show && showBgImage && (
        <AbsoluteFill
          style={{
            transform: `translate(${bgLayer.x}px, ${bgLayer.y}px) scale(${bgLayer.scale}) rotate(${bgLayer.rotation}deg)`,
            filter: `blur(${bgLayer.blur}px)`,
            mixBlendMode: bgLayer.mixBlendMode as any,
            opacity: mainFadeOpacity,
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

      {/* 背景パルスオーバーレイ（四隅から中央に向かってグラデーション・サビのみ） */}
      {bgLayer.show && showBgImage && isChorus && bgPulseIntensity > 0 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(255, 255, 255, ${pulseEffect * bgPulseIntensity}) 100%)`,
            pointerEvents: 'none',
            opacity: mainFadeOpacity,
          }}
        />
      )}

      {/* Layer 2: Yui画像（中間レイヤー・瞬きあり） */}
      {yuiLayer.show && showYui && (
        <AbsoluteFill
          style={{
            transform: `translate(${yuiLayer.x}px, ${yuiLayer.y}px) scale(${yuiLayer.scale}) rotate(${yuiLayer.rotation}deg)`,
            filter: `blur(${yuiLayer.blur}px)`,
            mixBlendMode: yuiLayer.mixBlendMode as any,
            opacity: yuiFadeOpacity,
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

      {/* Layer 3: 黒背景のフェードイン（半透明でYuiが透ける） */}
      <AbsoluteFill
        style={{
          backgroundColor: '#000000',
          opacity: blackBgOpacity,
        }}
      />

      {/* Layer 4: 収束テキストアニメーション（フェードアウト途中から出現） */}
      {showText && <Sequence from={settlingTextStartFrame} layout="none">
        <SettlingTextPhysics
          {...{
            '📝 1行目': 'CryptoNinja CoffeeTime',
            '📝 2行目': '',
            '📝 3行目': '',
            '📝 4行目': '',
            '🎨 文字色': ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
            '🖼️ 背景色': 'transparent',
            '📏 フォントサイズ': 120,
            '🎬 登場アニメーション': false,
            '⚡ 登場速度(frames)': 12,
            '🎯 登場遅延(frames)': 2,
            '🎲 初期ランダム範囲X': 400,
            '🎲 初期ランダム範囲Y': 300,
            '🌍 重力': 1,
            '🏀 反発': 0.6,
            '🧲 引力の強さ': 2,
            '💨 減衰率': 0.98,
            '🎯 収束距離(px)': 10,
            '✨ グロー': false,
          }}
        />
      </Sequence>}

      {/* Layer 5: 花びら＋キラキラアニメーション（最上レイヤー・01:00からフェードアウト） */}
      <AbsoluteFill style={{ opacity: petalFadeOpacity }}>
        <BPMEffects
          intensity={effectIntensity}
          speed={effectSpeed}
          particleCount={particleCount}
          bpm={bpm}
          bpmSyncIntensity={bpmSyncIntensity}
          bpmOffset={bpmOffset}
          showBeatIndicator={showBeatIndicator}
          showPetals={showPetals}
          showSparkles={showSparkles}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
