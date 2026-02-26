import React from "react";
import { Composition } from "remotion";
import { LifeIsmamagotoComposition, lifeIsmamagotoSchema } from "./LifeIsmamagotoComposition";
import { LifeIsmamagotoNoBlink, lifeIsmamagotoNoBlinkSchema } from "./LifeIsmamagotoNoBlink";
import { LifeIsmamagotoBPM, lifeIsmamagotoBPMSchema } from "./LifeIsmamagotoBPM";
import { LifeIsmamagotoBPMBgPulse, lifeIsmamagotoBPMBgPulseSchema } from "./LifeIsmamagotoBPMBgPulse";
import { FallingTextPhysics, fallingTextPhysicsSchema } from "./FallingTextPhysics";
import { SettlingTextPhysics, settlingTextPhysicsSchema } from "./SettlingTextPhysics";

const commonProps = {
  bgLayer: {
    show: true,
    opacity: 0.94,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    blur: 0,
    mixBlendMode: 'normal' as const,
  },
  yuiLayer: {
    show: true,
    opacity: 1,
    x: 72,
    y: 123,
    scale: 0.88,
    rotation: 0,
    blur: 0,
    mixBlendMode: 'normal' as const,
  },
  effectIntensity: 1,
  effectSpeed: 1.23,
  particleCount: 110,
  backgroundColor: 'transparent',
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 瞬きなしバージョン */}
      <Composition
        id="LifeIsmamagoto-NoBlink"
        component={LifeIsmamagotoNoBlink}
        schema={lifeIsmamagotoNoBlinkSchema}
        defaultProps={commonProps}
        durationInFrames={1788}
        fps={30}
        width={2048}
        height={2048}
      />

      {/* 瞬きありバージョン */}
      <Composition
        id="LifeIsmamagoto-WithBlink"
        component={LifeIsmamagotoComposition}
        schema={lifeIsmamagotoSchema}
        defaultProps={commonProps}
        durationInFrames={1788}
        fps={30}
        width={2048}
        height={2048}
      />

      {/* BPM同期バージョン（キラキラがBPMに同期） */}
      <Composition
        id="LifeIsmamagoto-BPM"
        component={LifeIsmamagotoBPM}
        schema={lifeIsmamagotoBPMSchema}
        defaultProps={{
          '背景レイヤー': {
            show: true,
            opacity: 0.94,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            blur: 0,
            mixBlendMode: 'normal' as const,
          },
          'Yuiレイヤー': {
            show: true,
            opacity: 1,
            x: 72,
            y: 123,
            scale: 0.88,
            rotation: 0,
            blur: 0,
            mixBlendMode: 'normal' as const,
          },
          '🌸 エフェクト強度': 1,
          '⚡ エフェクト速度': 1.38,
          '✨ パーティクル数': 170,
          '🎨 背景色': 'transparent',
          '🎵 BPM': 92,
          '💫 BPM同期の強度': 1.08,
          '⏱️ BPM同期オフセット': 33,
          '📊 ビート表示': false,
        }}
        durationInFrames={1788}
        fps={30}
        width={2048}
        height={2048}
      />

      {/* BPM同期 + 背景パルスバージョン（背景がビートで明るくなる） */}
      <Composition
        id="LifeIsmamagoto-BPM-BgPulse"
        component={LifeIsmamagotoBPMBgPulse}
        schema={lifeIsmamagotoBPMBgPulseSchema}
        defaultProps={{
          '背景レイヤー': {
            show: true,
            opacity: 0.94,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            blur: 0,
            mixBlendMode: 'normal' as const,
          },
          'Yuiレイヤー': {
            show: true,
            opacity: 1,
            x: 72,
            y: 123,
            scale: 0.88,
            rotation: 0,
            blur: 0,
            mixBlendMode: 'normal' as const,
          },
          '🌸 エフェクト強度': 1,
          '⚡ エフェクト速度': 1.38,
          '✨ パーティクル数': 170,
          '🎨 背景色': 'transparent',
          '🎵 BPM': 92,
          '💫 BPM同期の強度': 1.08,
          '⏱️ BPM同期オフセット': 0,
          '📊 ビート表示': false,
          '🌟 背景パルス強度': 0.05,
          '🖼️ 背景画像を表示': true,
          '👩 Yuiを表示': true,
          '🌸 花びらを表示': true,
          '✨ キラキラを表示': true,
          '📝 テキストを表示': true,
        }}
        durationInFrames={2088}
        fps={30}
        width={2048}
        height={2048}
      />

      {/* 落下テキスト（物理演算） */}
      <Composition
        id="FallingText-Demo"
        component={FallingTextPhysics}
        schema={fallingTextPhysicsSchema}
        defaultProps={{
          '📝 1行目': 'Crypto',
          '📝 2行目': 'Ninja',
          '📝 3行目': '',
          '📝 4行目': '',
          '🎨 文字色': ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
          '🖼️ 背景色': '#0a0a0a',
          '📏 フォントサイズ': 180,
          '⏱️ 表示時間(ms)': 1500,
          '💨 落下間隔(ms)': 180,
          '🌍 重力': 2,
          '🏀 反発': 0.2,
          '✨ グロー': false,
          '🎬 登場アニメーション': true,
          '⚡ 登場速度(frames)': 12,
          '🎯 登場遅延(frames)': 2,
        }}
        durationInFrames={400}
        fps={30}
        width={2048}
        height={2048}
      />

      {/* 落下テキスト（CoffeeTime） */}
      <Composition
        id="FallingText-CoffeeTime"
        component={FallingTextPhysics}
        schema={fallingTextPhysicsSchema}
        defaultProps={{
          '📝 1行目': 'Crypto',
          '📝 2行目': 'Ninja',
          '📝 3行目': 'Coffee',
          '📝 4行目': 'Time',
          '🎨 文字色': ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
          '🖼️ 背景色': '#0a0a0a',
          '📏 フォントサイズ': 180,
          '⏱️ 表示時間(ms)': 1500,
          '💨 落下間隔(ms)': 180,
          '🌍 重力': 2,
          '🏀 反発': 0.2,
          '✨ グロー': false,
          '🎬 登場アニメーション': true,
          '⚡ 登場速度(frames)': 12,
          '🎯 登場遅延(frames)': 2,
        }}
        durationInFrames={600}
        fps={30}
        width={2048}
        height={2048}
      />

      {/* 収束テキスト（CoffeeTime - ランダム位置から正規位置に収束） */}
      <Composition
        id="SettlingText-CoffeeTime"
        component={SettlingTextPhysics}
        schema={settlingTextPhysicsSchema}
        defaultProps={{
          '📝 1行目': 'Crypto',
          '📝 2行目': 'Ninja',
          '📝 3行目': 'Coffee',
          '📝 4行目': 'Time',
          '🎨 文字色': ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
          '🖼️ 背景色': '#0a0a0a',
          '📏 フォントサイズ': 180,
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
        durationInFrames={600}
        fps={30}
        width={2048}
        height={2048}
      />
    </>
  );
};
