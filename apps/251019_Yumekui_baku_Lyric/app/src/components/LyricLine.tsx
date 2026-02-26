// ========================================
// リリックライン（スロットタイピング）
// ========================================

import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { LyricCharComponent } from "./LyricChar";
import type { LyricChar, AppConfig, Beat, Chorus, Melody } from "../lib/types";
import { isInChorus } from "../lib/timing";

const SLOT_COUNT = 10;
const PRE_APPEAR = 0.1;
const POST_HOLD = 0.3;

const BREAK_CHARS = new Set([
  " ",
  "　",
  "、",
  "。",
  ",",
  ".",
  "・",
  "!",
  "?",
  "！",
  "？",
  "〜",
  "-",
]);

const SMALL_KANA = new Set(
  "ぁぃぅぇぉっゃゅょァィゥェォッャュョヮゎゕゖ".split("")
);

const HIRAGANA = /[぀-ゟ]/;
const KATAKANA = /[゠-ヿㇰ-ㇿ]/;
const KANJI = /[一-鿿]/;
const LATIN = /[A-Za-z]/;
const DIGIT = /[0-9０-９]/;

const scriptOf = (ch: string): string => {
  if (!ch) return "other";
  if (BREAK_CHARS.has(ch)) return "break";
  if (HIRAGANA.test(ch)) return "hiragana";
  if (KATAKANA.test(ch)) return "katakana";
  if (KANJI.test(ch)) return "kanji";
  if (LATIN.test(ch)) return "latin";
  if (DIGIT.test(ch)) return "digit";
  return "other";
};

const shouldBreakBetween = (prev: string | undefined, next: string | undefined) => {
  if (!prev || !next) return false;
  if (BREAK_CHARS.has(prev) || BREAK_CHARS.has(next)) return true;

  const prevScript = scriptOf(prev);
  const nextScript = scriptOf(next);
  if (prevScript !== nextScript) {
    const prevKana = prevScript === "hiragana" || prevScript === "katakana";
    const nextKana = nextScript === "hiragana" || nextScript === "katakana";
    if (prevKana && nextKana) {
      if (SMALL_KANA.has(prev) || SMALL_KANA.has(next)) {
        return false;
      }
    }
    return true;
  }
  return false;
};

const splitIntoLines = (chars: LyricChar[]): LyricChar[][] => {
  const lines: LyricChar[][] = [];
  let working: LyricChar[] = [];

  const flush = (count: number) => {
    if (count <= 0) return;
    lines.push(working.slice(0, count));
    working = working.slice(count);
  };

  for (let i = 0; i < chars.length; i++) {
    working.push(chars[i]);

    while (working.length > SLOT_COUNT) {
      let splitIndex = -1;
      for (let j = SLOT_COUNT; j > 0; j--) {
        const prev = working[j - 1]?.char;
        const next = working[j]?.char;
        if (shouldBreakBetween(prev, next)) {
          splitIndex = j;
          break;
        }
      }
      if (splitIndex === -1) {
        splitIndex = SLOT_COUNT;
      }
      flush(splitIndex);
    }

    const current = working[working.length - 1]?.char;
    const next = chars[i + 1]?.char;

    if (shouldBreakBetween(current, next)) {
      flush(working.length);
    }
  }

  if (working.length > 0) {
    flush(working.length);
  }

  return lines;
};

interface LyricLineProps {
  lyrics: LyricChar[];
  config: AppConfig;
  beats: Beat[];
  choruses: Chorus[];
  melodies?: Melody[];
}

export const LyricLine: React.FC<LyricLineProps> = ({
  lyrics,
  config,
  beats,
  choruses,
  melodies = [],
}) => {
  const frame = useCurrentFrame();
  const fps = config.fps ?? 30;
  const currentTime = frame / fps;

  const lines = useMemo(() => splitIntoLines(lyrics), [lyrics]);

  const holdMap = useMemo(() => {
    const map = new Map<number, number>();
    const tail = 0.35;
    for (let i = 0; i < lyrics.length; i++) {
      const char = lyrics[i];
      const next = lyrics[i + 1];
      const fallback = char.end_sec + tail;
      if (!next) {
        map.set(char.index, fallback);
        continue;
      }
      const nextStart = next.start_sec;
      const holdUntil = Math.max(
        char.end_sec,
        Math.min(fallback, nextStart - 0.05)
      );
      map.set(char.index, holdUntil);
    }
    return map;
  }, [lyrics]);

  const isChorusTime = useMemo(
    () => isInChorus(choruses, currentTime),
    [choruses, currentTime]
  );

  const fontSize = isChorusTime
    ? config.lyric.fontSizeChorus
    : config.lyric.fontSize;
  const glyphWidth = fontSize * (config.lyric.glyphWidthRatio ?? 0.78);
  const letterSpacing = config.lyric.letterSpacing;
  const slotWidth = glyphWidth + letterSpacing;
  const lineSpacing = fontSize * 1.3;

  const elements: React.ReactNode[] = [];

  lines.forEach((lineChars, lineIndex) => {
    if (lineChars.length === 0) {
      return;
    }

    const lineStart = lineChars[0].start_sec;
    const lineHoldEnd = lineChars.reduce((acc, ch) => {
      const holdUntil = holdMap.get(ch.index) ?? ch.end_sec;
      return Math.max(acc, holdUntil);
    }, lineStart);

    const isVisible =
      currentTime >= lineStart - PRE_APPEAR &&
      currentTime <= lineHoldEnd + POST_HOLD;

    if (!isVisible) {
      return;
    }

    const startX = -((lineChars.length - 1) * slotWidth) / 2;
    const baseY = (config.lyric.baselineY ?? 0) + lineIndex * lineSpacing;

    lineChars.forEach((char, slotIndex) => {
      const holdUntil = holdMap.get(char.index) ?? char.end_sec;
      const x = startX + slotIndex * slotWidth;
      const y = baseY;

      elements.push(
        <LyricCharComponent
          key={char.index}
          lyric={char}
          config={config}
          beats={beats}
          melodies={melodies}
          isChorus={isChorusTime}
          x={x}
          y={y}
          holdUntil={holdUntil}
          glyphWidth={glyphWidth}
        />
      );
    });
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {elements}
    </div>
  );
};
