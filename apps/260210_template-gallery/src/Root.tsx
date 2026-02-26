import React from "react";
import { Composition, staticFile } from "remotion";
import "./index.css";

// @ts-ignore
import * as RansomNoteSamples from "../テンプレート/ランサムノート/RansomNote_samples";
// @ts-ignore
import * as ExplosionSamples from "../テンプレート/爆発リリック/samples";
// @ts-ignore
import * as PhysicsSamples from "../テンプレート/物理演算リリック/FallingTextPhysics_samples";
// @ts-ignore
import * as KineticTypographySamples from "../テンプレート/キネティックタイポグラフィ/samples";
// @ts-ignore
import * as SolidSlashSamples from "../テンプレート/ソリッドスラッシュ/samples";
// @ts-ignore
import { ImageOverlay, imageOverlaySchema } from "../テンプレート/画像オーバーレイ/ImageOverlay";
// @ts-ignore
import { MultiLayerOverlay, multiLayerOverlaySchema } from "../テンプレート/多層レイヤー/MultiLayerOverlay";
// @ts-ignore
import { HopCustomComposition, hopAnimationSchema } from "../テンプレート/ホップアニメーション/HopCustomComposition";
// @ts-ignore
import { HopLyricTemplate, hopLyricTemplateSchema } from "../テンプレート/ホップアニメーション/HopLyricTemplate";
// @ts-ignore
import { DecoupledRectSample } from "../テンプレート/分離キネティック/samples";
// @ts-ignore
import * as AnimationTextSamples from "../テンプレート/アニメーションテキスト/samples";


export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ランサムノート */}
      {Object.entries(RansomNoteSamples).map(([name, Component]) => (
        <Composition
          key={`RansomNote/${name}`}
          id={`RansomNote-${name}`}
          component={Component}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}

      {/* 爆発リリック */}
      {Object.entries(ExplosionSamples).map(([name, Component]) => (
        <Composition
          key={`Explosion/${name}`}
          id={`Explosion-${name}`}
          component={Component}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}

      {/* 物理演算リリック */}
      {Object.entries(PhysicsSamples).map(([name, Component]) => (
        <Composition
          key={`Physics/${name}`}
          id={`Physics-${name}`}
          component={Component}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}

      {/* キネティックタイポグラフィ */}
      {Object.entries(KineticTypographySamples).map(([name, Component]) => (
        <Composition
          key={`Kinetic/${name}`}
          id={`Kinetic-${name}`}
          component={Component}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}

      {/* ホップアニメーション カスタム */}
      <Composition
        id="HopCustom"
        component={HopCustomComposition}
        schema={hopAnimationSchema}
        defaultProps={{
          text: "カスタマイズ可能！",
          hopHeight: 80,
          hopDuration: 20,
          staggerDelay: 3,
          bounceEffect: true,
          rotation: 15,
          scale: 1.2,
          color: "#ffffff",
          highlightColor: "#ffcc00",
          backgroundColor: "#111111",
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ホップリリック */}
      <Composition
        id="HopLyric"
        component={HopLyricTemplate}
        schema={hopLyricTemplateSchema}
        defaultProps={{
          text: "歌詞テキスト",
          fontFamily: "Noto Sans JP",
          fontSize: 72,
          fontWeight: "bold",
          letterSpacing: 2,
          textAlign: "center",
          verticalAlign: "center",
          offsetX: 0,
          offsetY: 0,
          startFrame: 10,
          hopHeight: 60,
          hopDuration: 20,
          staggerDelay: 3,
          bounceEffect: true,
          rotation: 0,
          scale: 1.2,
          color: "#ffffff",
          highlightColor: "#ffcc00",
          textShadowEnabled: true,
          textShadowColor: "#000000",
          textShadowBlur: 10,
          textShadowOffsetX: 2,
          textShadowOffsetY: 4,
          textOutlineEnabled: false,
          textOutlineColor: "#000000",
          textOutlineWidth: 2,
          backgroundColor: "#111111",
          showBackgroundImage: false,
          backgroundImageOpacity: 0.5,
          backgroundImageBlur: 0,
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ソリッドスラッシュ */}
      {Object.entries(SolidSlashSamples).map(([name, Component]) => (
        <Composition
          key={`SolidSlash/${name}`}
          id={`SolidSlash-${name}`}
          component={Component}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}

      {/* 画像オーバーレイ */}
      <Composition
        id="ImageOverlay"
        component={ImageOverlay}
        schema={imageOverlaySchema}
        defaultProps={{
          effectType: 'petalSparkle',
          intensity: 1,
          speed: 2.98,
          particleCount: 500,
          showImage: true,
          imageOpacity: 0.87,
          backgroundColor: '#ffffff',
          backgroundImage: staticFile('sample-cafe.jpg'),
        }}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
      />

      {/* 多層レイヤー */}
      <Composition
        id="MultiLayer"
        component={MultiLayerOverlay}
        schema={multiLayerOverlaySchema}
        defaultProps={{
          backgroundColor: '#ffffff',
          cafeLayer: { show: true, x: 0, y: 0, scale: 1.16, opacity: 1 },
          yuiLayer: { show: true, x: 101, y: 0, scale: 0.92, opacity: 1 },
          flowerLayer: { show: true, x: -14, y: 0, scale: 1.63, opacity: 0.85 },
          flowerRotationSpeed: 0.05,
          effect1Intensity: 1,
          effect1Speed: 1.5,
          effect1Count: 200,
          effect1Blur: 2,
          effect2Intensity: 0.5,
          effect2Speed: 2,
          effect2Count: 100,
          effect2CenterFade: 0.8,
          effect2CenterRadius: 250,
        }}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
      />

      {/* 分離キネティック */}
      <Composition
        id="DecoupledRect-Sample"
        component={DecoupledRectSample}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* アニメーションテキスト（remotion-animate-text & remotion-animation） */}
      {Object.entries(AnimationTextSamples).map(([name, Component]) => (
        <Composition
          key={`AnimText/${name}`}
          id={`AnimText-${name}`}
          component={Component}
          durationInFrames={name === "LyricSequence" ? 300 : 150}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}
    </>
  );
};
