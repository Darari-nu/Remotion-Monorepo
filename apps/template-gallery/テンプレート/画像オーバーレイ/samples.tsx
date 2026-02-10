import React, { lazy, Suspense } from 'react';
import { staticFile } from 'remotion';

const ImageOverlayLazy = lazy(() =>
  import('./ImageOverlay').then((module) => ({ default: module.ImageOverlay }))
);

const ImageOverlay = (props: React.ComponentProps<typeof ImageOverlayLazy>) => (
  <Suspense fallback={null}>
    <ImageOverlayLazy {...props} />
  </Suspense>
);

// サンプル画像のパス（publicフォルダに配置想定）
// 実際に使う時は staticFile('your-image.jpg') に変更してください
const SAMPLE_IMAGE = staticFile('sample-cafe.jpg');

// ===========================================
// 1. ゴールドダスト・シャワー
// ===========================================

// 1-1. ウォームゴールド（温かみのある金色）
export const GoldDustWarm = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="goldDust"
    intensity={0.8}
    speed={1}
    particleCount={60}
    colorPalette={['#FFD700', '#FFA500', '#FFEC8B', '#F4A460']}
  />
);

// 1-2. クールシルバー（銀色系）
export const GoldDustSilver = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="goldDust"
    intensity={0.7}
    speed={0.8}
    particleCount={50}
    colorPalette={['#C0C0C0', '#E8E8E8', '#B8B8B8', '#D3D3D3']}
  />
);

// 1-3. ローズゴールド（ピンク系）
export const GoldDustRose = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="goldDust"
    intensity={0.75}
    speed={1.2}
    particleCount={70}
    colorPalette={['#FFB6C1', '#FF69B4', '#FFD700', '#FFC0CB']}
  />
);

// ===========================================
// 2. オーラ・パルス
// ===========================================

// 2-1. ゴールデンオーラ（ドア中央から）
export const AuraPulseGolden = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="auraPulse"
    intensity={0.6}
    speed={1}
    colorPalette={['#FFD700', '#FFF8DC', '#FFEFD5']}
  />
);

// 2-2. ピンクオーラ（花のイメージ）
export const AuraPulsePink = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="auraPulse"
    intensity={0.5}
    speed={0.8}
    colorPalette={['#FFB6C1', '#FF69B4', '#FFC0CB']}
  />
);

// 2-3. ホワイトオーラ（神聖な感じ）
export const AuraPulseWhite = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="auraPulse"
    intensity={0.7}
    speed={1.2}
    colorPalette={['#FFFFFF', '#FFFAFA', '#FFF5EE']}
  />
);

// ===========================================
// 3. フローティング・スパークル
// ===========================================

// 3-1. スターダスト（星のような輝き）
export const FloatingSparkleStardust = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="floatingSparkle"
    intensity={0.8}
    speed={0.7}
    particleCount={40}
    colorPalette={['#FFFFFF', '#FFFACD', '#FFE4B5', '#FFD700']}
  />
);

// 3-2. フェアリーダスト（妖精の粉）
export const FloatingSparkleFairy = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="floatingSparkle"
    intensity={0.75}
    speed={1}
    particleCount={50}
    colorPalette={['#FF69B4', '#FFB6C1', '#FFFACD', '#E6E6FA']}
  />
);

// 3-3. ダイヤモンドダスト（冷たい輝き）
export const FloatingSparkleDiamond = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="floatingSparkle"
    intensity={0.9}
    speed={0.5}
    particleCount={35}
    colorPalette={['#FFFFFF', '#E0FFFF', '#B0E0E6', '#ADD8E6']}
  />
);

// ===========================================
// 4. レンズフレア
// ===========================================

// 4-1. シネマティックフレア（映画風）
export const LensFlareCinematic = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="lensFlare"
    intensity={0.7}
    speed={0.5}
    colorPalette={['#FFD700', '#FFA500', '#FF8C00']}
  />
);

// 4-2. ソフトフレア（柔らかい光）
export const LensFlareSoft = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="lensFlare"
    intensity={0.5}
    speed={0.3}
    colorPalette={['#FFFACD', '#FFF8DC', '#FFEFD5']}
  />
);

// 4-3. ドリームフレア（夢幻的）
export const LensFlareDream = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="lensFlare"
    intensity={0.6}
    speed={0.4}
    colorPalette={['#FFB6C1', '#FFDAB9', '#E6E6FA']}
  />
);

// ===========================================
// 5. ミスト・グロウ
// ===========================================

// 5-1. モーニングミスト（朝霧）
export const MistGlowMorning = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="mistGlow"
    intensity={0.5}
    speed={0.6}
    colorPalette={['#FFE4C4', '#FFDAB9', '#FFE4B5']}
  />
);

// 5-2. ロマンティックミスト（ピンク霧）
export const MistGlowRomantic = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="mistGlow"
    intensity={0.4}
    speed={0.8}
    colorPalette={['#FFB6C1', '#FFC0CB', '#FFE4E1']}
  />
);

// 5-3. ミスティックフォグ（神秘的）
export const MistGlowMystic = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="mistGlow"
    intensity={0.6}
    speed={0.5}
    colorPalette={['#E6E6FA', '#D8BFD8', '#DDA0DD']}
  />
);

// ===========================================
// 6. 花びら＋スパークル複合
// ===========================================

// 6-1. 桜吹雪（サクラ）
export const PetalSparkleSakura = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="petalSparkle"
    intensity={0.7}
    speed={0.8}
    particleCount={45}
    colorPalette={['#FFB6C1', '#FF69B4', '#FFC0CB', '#FFE4E1']}
  />
);

// 6-2. ローズペタル（バラ）
export const PetalSparkleRose = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="petalSparkle"
    intensity={0.75}
    speed={0.6}
    particleCount={35}
    colorPalette={['#DC143C', '#FF1493', '#FF69B4', '#FFB6C1']}
  />
);

// 6-3. ゴールデンペタル（金色の花びら）
export const PetalSparkleGolden = () => (
  <ImageOverlay
    backgroundImage={SAMPLE_IMAGE}
    effectType="petalSparkle"
    intensity={0.8}
    speed={1}
    particleCount={50}
    colorPalette={['#FFD700', '#FFA500', '#FFEC8B', '#FFE4B5']}
  />
);

// ===========================================
// 背景なしバージョン（合成用）
// ===========================================

// 透明背景 - ゴールドダスト
export const OverlayGoldDust = () => (
  <ImageOverlay
    effectType="goldDust"
    intensity={0.9}
    speed={1}
    particleCount={60}
  />
);

// 透明背景 - 花びら
export const OverlayPetals = () => (
  <ImageOverlay
    effectType="petalSparkle"
    intensity={0.85}
    speed={0.8}
    particleCount={50}
  />
);

// 透明背景 - スパークル
export const OverlaySparkle = () => (
  <ImageOverlay
    effectType="floatingSparkle"
    intensity={0.9}
    speed={0.7}
    particleCount={45}
  />
);
