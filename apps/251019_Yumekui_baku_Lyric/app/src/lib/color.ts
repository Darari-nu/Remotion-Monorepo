// ========================================
// カラーユーティリティ
// ========================================

import type { AppConfig } from "./types";

// Hex → RGBA
export function hexToRGBA(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// コード（メジャー/マイナー）に応じた色補正
export function getChordColorShift(
  chord: string,
  palette: AppConfig["theme"]["palette"]
): string {
  const isMajor = !chord.includes("m") || chord.includes("maj");
  return isMajor ? palette.gold : palette.indigo;
}

// 露出補正（EV）→ CSS filter brightness
export function exposureToBrightness(ev: number): number {
  return Math.pow(2, ev);
}

// 線形補間
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// カラーブレンド（簡易）
export function blendColors(
  color1: string,
  color2: string,
  ratio: number
): string {
  // 簡易実装: 単純に ratio で切り替え
  return ratio > 0.5 ? color2 : color1;
}
