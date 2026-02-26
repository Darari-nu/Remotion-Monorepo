// ========================================
// CSV/SRT パーサー: 夢くいバク リリックビデオ
// papaparse を使用した実装
// ========================================

import Papa from "papaparse";
import type {
  Beat,
  Downbeat,
  Bar,
  Onset,
  Segment,
  Chorus,
  KeyEstimate,
  Chord,
  Melody,
  LyricChar,
  AnalysisSummary,
  Manifest,
} from "./types";

// SRT タイムスタンプを秒に変換
function srtTimeToSeconds(timeStr: string): number {
  const [hours, minutes, rest] = timeStr.split(":");
  const [seconds, millis] = rest.split(",");
  return (
    parseInt(hours) * 3600 +
    parseInt(minutes) * 60 +
    parseInt(seconds) +
    parseInt(millis) / 1000
  );
}

// CSV を papaparse でパース（ヘッダースキップ）
function parseCSV<T = Record<string, unknown>>(content: string): T[] {
  const result = Papa.parse<T>(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true, // 数値は自動で number に変換
    transform: (value: string) => value.trim(),
  });

  if (result.errors.length > 0) {
    console.warn("CSV parse warnings:", result.errors);
  }

  return result.data;
}

// ========================================
// Beats
// ========================================
export function parseBeats(csvContent: string): Beat[] {
  const rows = parseCSV<{
    beat_index: number;
    time_sec: number;
  }>(csvContent);

  return rows
    .filter((row) => typeof row.beat_index === "number" && typeof row.time_sec === "number")
    .map((row) => ({
      beat_index: row.beat_index,
      time_sec: row.time_sec,
    }));
}

// ========================================
// Downbeats
// ========================================
export function parseDownbeats(csvContent: string): Downbeat[] {
  const rows = parseCSV<{
    bar_index: number;
    time_sec: number;
    time_signature?: string;
  }>(csvContent);

  return rows
    .filter((row) => typeof row.bar_index === "number" && typeof row.time_sec === "number")
    .map((row) => ({
      bar_index: row.bar_index,
      time_sec: row.time_sec,
    }));
}

// ========================================
// Bars
// ========================================
export function parseBars(csvContent: string): Bar[] {
  const rows = parseCSV<{
    bar_index: number;
    start_sec: number;
    end_sec: number;
    beat_count?: number;
  }>(csvContent);

  return rows
    .filter(
      (row) =>
        typeof row.bar_index === "number" &&
        typeof row.start_sec === "number" &&
        typeof row.end_sec === "number"
    )
    .map((row) => ({
      bar_index: row.bar_index,
      start_sec: row.start_sec,
      end_sec: row.end_sec,
      duration_sec: row.end_sec - row.start_sec,
    }));
}

// ========================================
// Onsets (Loudness)
// ========================================
export function parseOnsets(csvContent: string): Onset[] {
  // カラム: frame_index,time_sec,onset_strength
  const rows = parseCSV<{
    frame_index: number;
    time_sec: number;
    onset_strength: number;
  }>(csvContent);
  return rows.map((row) => ({
    frame_index: row.frame_index,
    time_sec: row.time_sec,
    onset_strength: row.onset_strength,
  }));
}

// ========================================
// Segments
// ========================================
export function parseSegments(csvContent: string): Segment[] {
  const rows = parseCSV<{
    segment_index: number;
    start_sec: number;
    end_sec: number;
    label: string;
  }>(csvContent);

  return rows
    .filter(
      (row) =>
        typeof row.start_sec === "number" &&
        typeof row.end_sec === "number" &&
        typeof row.label === "string"
    )
    .map((row) => ({
      start_sec: row.start_sec,
      end_sec: row.end_sec,
      duration_sec: row.end_sec - row.start_sec,
      label: row.label,
    }));
}

// ========================================
// Chorus Sections
// ========================================
export function parseChorusSections(csvContent: string): Chorus[] {
  const rows = parseCSV<{
    candidate_rank: number;
    start_sec: number;
    end_sec: number;
    score: number;
  }>(csvContent);

  return rows
    .filter(
      (row) =>
        typeof row.candidate_rank === "number" &&
        typeof row.start_sec === "number" &&
        typeof row.end_sec === "number"
    )
    .map((row) => ({
      rank: row.candidate_rank,
      start_sec: row.start_sec,
      end_sec: row.end_sec,
      duration_sec: row.end_sec - row.start_sec,
      score: row.score ?? 0,
    }));
}

// ========================================
// Key Estimate
// ========================================
export function parseKeyEstimate(csvContent: string): KeyEstimate[] {
  const rows = parseCSV<{
    time_sec?: number;
    key: string;
    scale: string;
    confidence: number;
  }>(csvContent);

  return rows
    .filter((row) => typeof row.key === "string")
    .map((row) => ({
      key: row.key,
      scale: (row.scale === "minor" || row.scale === "major" ? row.scale : "major") as
        | "minor"
        | "major",
      confidence: row.confidence ?? 0,
      time_sec: row.time_sec ?? 0,
    }));
}

// ========================================
// Chords
// ========================================
export function parseChords(csvContent: string): Chord[] {
  // カラム: time_sec,chord_symbol,confidence
  const rows = parseCSV<{
    time_sec: number;
    chord_symbol: string;
    confidence: number;
  }>(csvContent);

  const chords: Chord[] = [];
  for (let i = 0; i < rows.length; i++) {
    const start_sec = rows[i].time_sec;
    const end_sec = i < rows.length - 1 ? rows[i + 1].time_sec : start_sec + 0.1;
    chords.push({
      start_sec,
      end_sec,
      duration_sec: end_sec - start_sec,
      chord: rows[i].chord_symbol,
      confidence: rows[i].confidence,
    });
  }
  return chords;
}

// ========================================
// Melody F0
// ========================================
export function parseMelody(csvContent: string): Melody[] {
  // カラム: frame_index,time_sec,frequency_hz,voiced
  const rows = parseCSV<{
    frame_index: number;
    time_sec: number;
    frequency_hz: number;
    voiced: string | boolean;
  }>(csvContent);
  return rows
    .filter(
      (row) =>
        typeof row.frame_index === "number" &&
        typeof row.time_sec === "number" &&
        typeof row.frequency_hz === "number"
    )
    .map((row) => ({
      frame_index: row.frame_index,
      time_sec: row.time_sec,
      frequency_hz: row.frequency_hz,
      voiced:
        typeof row.voiced === "boolean"
          ? row.voiced
          : String(row.voiced).toLowerCase() === "true",
    }));
}

// ========================================
// Analysis Summary
// ========================================
export function parseAnalysisSummary(csvContent: string): AnalysisSummary {
  const rows = parseCSV<{
    metric: string;
    value: number;
    unit?: string;
  }>(csvContent);

  if (rows.length === 0) {
    throw new Error("analysis_summary.csv is empty");
  }

  const lookup = new Map<string, number>();
  rows.forEach((row) => {
    if (typeof row.metric === "string" && typeof row.value === "number") {
      lookup.set(row.metric, row.value);
    }
  });

  return {
    duration_sec: lookup.get("duration_sec") ?? 0,
    bpm: lookup.get("bpm") ?? lookup.get("tempo_bpm") ?? 0,
    estimated_bars: lookup.get("estimated_bars") ?? 0,
    sample_rate: lookup.get("sample_rate") ?? 0,
  };
}

// ========================================
// Lyrics (SRT)
// ========================================
export function parseLyricsSRT(srtContent: string): LyricChar[] {
  const blocks = srtContent.trim().split(/\r?\n\r?\n/);
  const lyrics: LyricChar[] = [];

  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/);
    if (lines.length < 3) continue;

    const index = Number.parseInt(lines[0], 10);
    const timeMatch = lines[1].match(/(\S+)\s+-->\s+(\S+)/);
    if (!timeMatch) continue;

    const start_sec = srtTimeToSeconds(timeMatch[1]);
    const end_sec = srtTimeToSeconds(timeMatch[2]);
    const text = lines.slice(2).join("").trim();
    if (!text) continue;

    // 文字単位なので 1 文字ずつ分解
    Array.from(text).forEach((char, charOffset) => {
      lyrics.push({
        index: Number.isNaN(index) ? lyrics.length + 1 : index * 1000 + charOffset,
        char,
        start_sec,
        end_sec,
        duration_sec: end_sec - start_sec,
      });
    });
  }

  return lyrics;
}

// ========================================
// Manifest (JSON)
// ========================================
export function parseManifest(jsonContent: string): Manifest {
  return JSON.parse(jsonContent) as Manifest;
}
