// ========================================
// タイミング計算ユーティリティ
// ========================================

import type { Beat, Chorus, Onset, Segment } from "./types";

// 現在時刻に最も近いビートを取得
export function findNearestBeat(beats: Beat[], timeSec: number): Beat | null {
  if (beats.length === 0) return null;

  let nearest = beats[0];
  let minDiff = Math.abs(beats[0].time_sec - timeSec);

  for (const beat of beats) {
    const diff = Math.abs(beat.time_sec - timeSec);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = beat;
    }
  }

  return nearest;
}

// 現在時刻が指定ビートの直後かどうか（タイムウィンドウ内）
export function isJustAfterBeat(
  beat: Beat,
  timeSec: number,
  windowSec: number = 0.1
): boolean {
  const diff = timeSec - beat.time_sec;
  return diff >= 0 && diff <= windowSec;
}

// 現在時刻がサビ区間かどうか
export function isInChorus(choruses: Chorus[], timeSec: number): boolean {
  return choruses.some(
    (c) => timeSec >= c.start_sec && timeSec < c.end_sec
  );
}

// 現在時刻のトップランクサビを取得
export function getCurrentChorus(
  choruses: Chorus[],
  timeSec: number
): Chorus | null {
  const inChorus = choruses.filter(
    (c) => timeSec >= c.start_sec && timeSec < c.end_sec
  );
  if (inChorus.length === 0) return null;
  // rank が最小（1 が最高）のものを返す
  return inChorus.reduce((prev, curr) =>
    curr.rank < prev.rank ? curr : prev
  );
}

// 現在時刻の最強オンセットを取得（閾値以上）
export function getCurrentOnset(
  onsets: Onset[],
  timeSec: number,
  fps: number,
  threshold: number = 0.5
): Onset | null {
  // 現在フレーム付近のオンセットを検索
  const frameIndex = Math.floor(timeSec * fps);
  const onset = onsets.find(
    (o) => o.frame_index === frameIndex && o.onset_strength > threshold
  );
  return onset || null;
}

// 現在時刻のセグメントを取得
export function getCurrentSegment(
  segments: Segment[],
  timeSec: number
): Segment | null {
  return (
    segments.find((s) => timeSec >= s.start_sec && timeSec < s.end_sec) || null
  );
}

// ビートインデックスが3拍子の3拍目かどうか
export function isTripletThird(beat: Beat): boolean {
  return beat.beat_index % 3 === 2; // 0-indexed で 2 が3拍目
}

// 秒→フレーム
export function secToFrame(sec: number, fps: number): number {
  return Math.floor(sec * fps);
}

// フレーム→秒
export function frameToSec(frame: number, fps: number): number {
  return frame / fps;
}
