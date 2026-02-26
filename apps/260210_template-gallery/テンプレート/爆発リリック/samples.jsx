import React, { lazy, Suspense } from 'react';
const LyricExplosionTemplateLazy = lazy(() => import('./LyricExplosionTemplate'));

const LyricExplosionTemplate = (props) => (
  <Suspense fallback={null}>
    <LyricExplosionTemplateLazy {...props} />
  </Suspense>
);

// ==========================================
// サンプル実装集
// ==========================================

// だらさんの「夢喰いバク」風 - Set A (Emo)
export const YumeKuiBaku = () => (
  <LyricExplosionTemplate
    lyrics={[
      "夜空に浮かぶ",
      "星のように",
      "君への想い",
      "輝いてる",
      "優しい夢を",
      "見に行こう"
    ]}
    colors={['#FF6B9D', '#C44569', '#8B4789', '#6B5B95', '#4A5899']}
    background={{
      type: 'gradient',
      color1: '#0a0520',
      color2: '#1a0a3a'
    }}
    text={{
      fontSize: 80,
      fontFamily: '"Noto Sans JP", sans-serif',
      color: '#FFFFFF',
      glowColor: '#FF6B9D',
      glowBlur: 35
    }}
    physics={{
      velocityX: 7,
      velocityY: 7,
      velocityYBias: -3,
      gravity: 0.12,
      airResistance: 0.98
    }}
    glitch={{
      enabled: true,
      duration: 18,
      rgbSplit: 12,
      noiseLines: 6
    }}
  />
);
