import React, { lazy, Suspense } from 'react';
const FallingTextPhysicsLazy = lazy(() => import('./FallingTextPhysics'));

const FallingTextPhysics = (props) => (
  <Suspense fallback={null}>
    <FallingTextPhysicsLazy {...props} />
  </Suspense>
);

// ==========================================
// FallingTextPhysics サンプル実装集
// ==========================================

// デフォルト（バランス型）- Set C (Positive)
export const Default = () => (
  <FallingTextPhysics
    lyrics={[
      "新しい未来へ\n歩き出そう",
      "誰も知らない\n明日へ",
      "僕らだけの\n物語"
    ]}
  />
);
