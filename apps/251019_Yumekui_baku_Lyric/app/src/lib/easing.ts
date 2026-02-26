// ========================================
// イージング関数
// ========================================

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeOut(t: number): number {
  return t * (2 - t);
}

export function easeIn(t: number): number {
  return t * t;
}

export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// バネアニメーション風（簡易）
export function spring(
  t: number,
  damping: number = 200,
  stiffness: number = 100
): number {
  const decay = Math.exp(-damping * t);
  const oscillation = Math.cos(stiffness * t);
  return 1 - decay * oscillation;
}
