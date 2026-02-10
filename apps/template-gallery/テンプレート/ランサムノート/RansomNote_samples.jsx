import React, { lazy, Suspense } from 'react';
const RansomNoteLazy = lazy(() => import('./RansomNote'));

const RansomNote = (props) => (
  <Suspense fallback={null}>
    <RansomNoteLazy {...props} />
  </Suspense>
);

// ==========================================
// RansomNote サンプル実装集
// グランジでパンクなリリックビデオ用
// ==========================================

// デフォルト（バランス型）
export const Default = () => (
  <RansomNote
    lyrics={[
      "切り裂いた\n闇の中で\n衝動が\n今走り出す",
      "誰も知らない\n明日へ\n僕らだけの\n道を行く"
    ]}
  />
);
