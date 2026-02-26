// ========================================
// 文字単位リリックコンポーネント
// ========================================

import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { LyricChar, AppConfig, Beat, Melody } from "../lib/types";
import { findNearestBeat, isJustAfterBeat, isTripletThird } from "../lib/timing";
import { easeInOut } from "../lib/easing";

interface LyricCharProps {
  lyric: LyricChar;
  config: AppConfig;
  beats: Beat[];
  melodies?: Melody[];
  isChorus: boolean;
  x: number;
  y: number;
  holdUntil?: number | null;
  glyphWidth: number;
}

export const LyricCharComponent: React.FC<LyricCharProps> = ({
  lyric,
  config,
  beats,
  melodies = [],
  isChorus,
  x,
  y,
  holdUntil,
  glyphWidth,
}) => {
  const circOut = (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2));
  const quintIn = (t: number) => t * t * t * t * t;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const appearDuration = Math.max(0.05, config.lyric.fadeIn);
  const disappearDuration = Math.max(0.12, config.lyric.fadeOut);
  const appearStart = Math.max(0, lyric.start_sec - appearDuration);
  const visibleStart = lyric.start_sec;
  const visibleEnd = holdUntil ?? lyric.end_sec;
  const disappearEnd = visibleEnd + disappearDuration;

  const phase = useMemo(() => {
    if (currentTime < appearStart) return "before" as const;
    if (currentTime < visibleStart) return "appear" as const;
    if (currentTime <= visibleEnd) return "visible" as const;
    if (currentTime <= disappearEnd) return "disappear" as const;
    return "after" as const;
  }, [currentTime, appearStart, visibleStart, visibleEnd, disappearEnd]);

  const animation = useMemo(() => {
    if (phase === "before" || phase === "after") {
      return {
        opacity: 0,
        scale: 1,
        verticalOffset: 0,
      };
    }

    if (phase === "appear") {
      const progress = Math.min(
        1,
        Math.max(0, (currentTime - appearStart) / appearDuration)
      );
      const eased = circOut(progress);
      const scale = 1 + (10 - 1) * (1 - eased);
      const opacity = eased;
      return {
        opacity,
        scale,
        verticalOffset: 0,
      };
    }

    if (phase === "visible") {
      return {
        opacity: 1,
        scale: 1,
        verticalOffset: 0,
      };
    }

    const progress = Math.min(
      1,
      Math.max(0, (currentTime - visibleEnd) / disappearDuration)
    );
    const eased = quintIn(progress);
    const opacity = 1 - eased;
    const verticalOffset = -config.lyric.fontSize * 0.6 * eased;
    return {
      opacity,
      scale: 1,
      verticalOffset,
    };
  }, [phase, currentTime, appearStart, appearDuration, visibleEnd, disappearDuration, config.lyric.fontSize]);

  if (animation.opacity <= 0) {
    return null;
  }

  const nearestBeat = useMemo(
    () => findNearestBeat(beats, currentTime),
    [beats, currentTime]
  );

  const adjustedBeatTime = useMemo(() => {
    if (!nearestBeat) return 0;
    if (!isTripletThird(nearestBeat)) {
      return nearestBeat.time_sec;
    }
    const delayMs = config.beat.tripletDelayMs;
    return nearestBeat.time_sec + delayMs / 1000;
  }, [nearestBeat, config.beat.tripletDelayMs]);

  const beatScale = useMemo(() => {
    if (!nearestBeat) return config.beat.scaleMin;
    const timeSinceBeat = currentTime - adjustedBeatTime;
    if (timeSinceBeat < 0 || timeSinceBeat > 0.15) {
      return config.beat.scaleMin;
    }

    const progress = timeSinceBeat / 0.15;

    return interpolate(
      progress,
      [0, 0.5, 1],
      [config.beat.scaleMin, config.beat.scaleMax, config.beat.scaleMin],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easeInOut,
      }
    );
  }, [nearestBeat, adjustedBeatTime, currentTime, config.beat]);

  const melodyOffset = useMemo(() => {
    if (melodies.length === 0) return 0;

    const frameIndex = Math.floor(currentTime * fps);
    const melody = melodies.find((m) => m.frame_index === frameIndex);

    if (!melody || !melody.voiced) return 0;

    const baseFreq = 261.63;
    const freqRatio = melody.frequency_hz / baseFreq;

    const offset = 40 * Math.log2(freqRatio);
    return Math.max(-40, Math.min(40, offset));
  }, [melodies, currentTime, fps]);

  const fontSize = isChorus
    ? config.lyric.fontSizeChorus
    : config.lyric.fontSize;

  const charStyle: React.CSSProperties = {
    position: "absolute",
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y + melodyOffset}px)`,
    transform: `translate(-50%, -50%) translateY(${animation.verticalOffset}px) scale(${animation.scale * beatScale})`,
    opacity: animation.opacity,
    transformOrigin: "center",
    fontFamily:
      '"Yu Mincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "Noto Serif JP", serif',
    fontWeight: config.lyric.fontWeight ?? 500,
    fontSize: `${fontSize}px`,
    color: config.theme.palette.milk,
    textShadow: `
      ${config.lyric.shadow.offsetY}px ${config.lyric.shadow.offsetY}px 0 ${config.lyric.shadow.color},
      0 0 ${config.lyric.stroke.blur}px ${config.lyric.stroke.color}
    `,
    WebkitTextStroke: `${config.lyric.stroke.width * 2}px ${config.lyric.stroke.color}`,
    letterSpacing: `${config.lyric.letterSpacing}px`,
    pointerEvents: "none",
  };

  return <div style={charStyle}>{lyric.char}</div>;
};
