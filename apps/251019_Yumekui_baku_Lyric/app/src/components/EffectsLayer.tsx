// ========================================
// エフェクトレイヤー（Skia 和紙グレイン + フォールバック）
// ========================================

import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SkiaCanvas } from "@remotion/skia";
import { Rect, Skia } from "@shopify/react-native-skia";
import type { AppConfig, Beat, Onset } from "../lib/types";
import { findNearestBeat, isJustAfterBeat, getCurrentOnset } from "../lib/timing";

interface EffectsLayerProps {
  config: AppConfig;
  beats: Beat[];
  onsets: Onset[];
}

const PAPER_SHADER = `
uniform vec2 resolution;
uniform float time;
uniform float intensity;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for(int i=0;i<5;i++){
    v += a * noise(p);
    p *= 2.05;
    a *= 0.5;
  }
  return v;
}

vec4 main(vec2 coord){
  vec2 uv = coord / resolution;
  float paper = fbm(uv * 65.0 + vec2(time * 0.04, 0.0));
  float fibers = fbm(vec2(uv.x * 220.0, uv.y * 7.5 + time * 0.03));
  float grain = mix(paper, fibers, 0.6);

  float sparkle = step(0.998, hash(floor(uv * 240.0 + time * 0.35))) * 0.18;

  vec3 base = vec3(0.12, 0.12, 0.12);
  vec3 color = base + vec3(grain * 0.1 - 0.05);
  color += vec3(sparkle) * vec3(0.82, 0.72, 0.55);

  float alpha = clamp(intensity * 0.7, 0.0, 0.45);
  return vec4(color, alpha);
}
`;

export const EffectsLayer: React.FC<EffectsLayerProps> = ({
  config,
  beats,
  onsets,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const currentTime = frame / fps;

  const nearestBeat = useMemo(
    () => findNearestBeat(beats, currentTime),
    [beats, currentTime]
  );

  const beatPulse = useMemo(() => {
    if (!nearestBeat) return 0;
    if (!isJustAfterBeat(nearestBeat, currentTime, 0.18)) return 0;
    const timeSinceBeat = currentTime - nearestBeat.time_sec;
    return interpolate(timeSinceBeat, [0, 0.18], [0.22, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }, [nearestBeat, currentTime]);

  const onset = useMemo(
    () => getCurrentOnset(onsets, currentTime, fps, config.onset.threshold),
    [onsets, currentTime, fps, config.onset.threshold]
  );

  const flashOpacity = useMemo(() => {
    if (!onset) return 0;
    const flashDuration = config.onset.flashDuration + 0.05;
    const timeSinceOnset = currentTime - onset.time_sec;
    if (timeSinceOnset > flashDuration) return 0;
    return interpolate(timeSinceOnset, [0, flashDuration], [0.28, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }, [onset, currentTime, config.onset.flashDuration]);

  const runtimeEffect = useMemo(() => {
    try {
      const effect = Skia.RuntimeEffect?.Make?.(PAPER_SHADER);
      if (!effect) {
        console.warn("RuntimeEffect compilation failed. Using CSS grain fallback.");
      }
      return effect ?? null;
    } catch (error) {
      console.warn("RuntimeEffect threw during compilation. Using CSS grain fallback.", error);
      return null;
    }
  }, []);

  const grainPaint = useMemo(() => {
    if (!runtimeEffect) return null;
    try {
      const uniforms = new Float32Array([
        width,
        height,
        currentTime,
        config.theme.grainOpacity,
      ]);
      const paint = Skia.Paint();
      paint.setShader(runtimeEffect.makeShader(Array.from(uniforms)));
      return paint;
    } catch (error) {
      console.warn("Skia shader creation failed. Falling back to CSS.", error);
      return null;
    }
  }, [runtimeEffect, width, height, currentTime, config.theme.grainOpacity]);

  const canvasStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  };

  const cssGrainStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(255,255,255,${config.theme.grainOpacity * 0.45}) 2px,
        rgba(255,255,255,${config.theme.grainOpacity * 0.45}) 4px
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,${config.theme.grainOpacity * 0.28}) 2px,
        rgba(0,0,0,${config.theme.grainOpacity * 0.28}) 4px
      )`,
    opacity: config.theme.grainOpacity,
    mixBlendMode: "overlay",
    pointerEvents: "none",
  };

  const cssPulseStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: config.theme.palette.milk,
    opacity: beatPulse,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };

  const cssFlashStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "#FFFFFF",
    opacity: flashOpacity,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };

  if (!runtimeEffect || !grainPaint) {
    return (
      <>
        <div style={cssGrainStyle} />
        {beatPulse > 0 && <div style={cssPulseStyle} />}
        {flashOpacity > 0 && <div style={cssFlashStyle} />}
      </>
    );
  }

  return (
    <>
      <div style={canvasStyle}>
        <SkiaCanvas width={width} height={height}>
          <Rect x={0} y={0} width={width} height={height} paint={grainPaint as any} />
        </SkiaCanvas>
      </div>

      {beatPulse > 0 && (
        <div style={canvasStyle}>
          <SkiaCanvas width={width} height={height}>
            <Rect x={0} y={0} width={width} height={height} color={`rgba(243,241,234,${beatPulse})`} />
          </SkiaCanvas>
        </div>
      )}

      {flashOpacity > 0 && (
        <div style={canvasStyle}>
          <SkiaCanvas width={width} height={height}>
            <Rect x={0} y={0} width={width} height={height} color={`rgba(255,255,255,${flashOpacity})`} />
          </SkiaCanvas>
        </div>
      )}
    </>
  );
};
