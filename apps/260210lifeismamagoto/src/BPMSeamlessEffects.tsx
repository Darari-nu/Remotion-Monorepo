import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { random } from 'remotion';

interface Petal {
  id: number;
  x: number;
  initialY: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  fallSpeed: number;
  swayAmplitude: number;
  swayFrequency: number;
  phase: number;
  color: string;
  opacity: number;
}

interface BPMEffectsProps {
  intensity?: number;
  speed?: number;
  colors?: string[];
  particleCount: number;
  bpm?: number;
  bpmSyncIntensity?: number;
  bpmOffset?: number; // BPM同期の開始オフセット（フレーム数）
  showBeatIndicator?: boolean; // ビートインジケーター表示/非表示
  showPetals?: boolean; // 花びら表示/非表示
  showSparkles?: boolean; // キラキラ表示/非表示
}

export const BPMEffects: React.FC<BPMEffectsProps> = ({
  intensity = 1,
  speed = 1,
  colors = ['#FFB6C1', '#FF69B4', '#FFC0CB', '#DB7093', '#FFE4E1'],
  particleCount,
  bpm = 93,
  bpmSyncIntensity = 1,
  bpmOffset = 0,
  showBeatIndicator = true,
  showPetals = true,
  showSparkles = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames, fps } = useVideoConfig();

  // サビのタイムライン設定 (秒 → フレーム)
  const chorus1Start = 21 * fps; // 00:21:00
  const chorus1End = 37.21 * fps; // 00:37:21
  const chorus2Start = 42 * fps; // 00:42:00
  const chorus2End = durationInFrames; // ラストまで

  // サビかどうかを判定
  const isChorus = (frame >= chorus1Start && frame <= chorus1End) || (frame >= chorus2Start && frame <= chorus2End);

  // サビへのフェードイン/アウト (3秒 = 90フレーム)
  const fadeFrames = 90;
  let chorusMultiplier = 1;

  if (isChorus) {
    // サビ開始時のフェードイン
    if (frame >= chorus1Start && frame < chorus1Start + fadeFrames) {
      chorusMultiplier = 1 + interpolate(frame, [chorus1Start, chorus1Start + fadeFrames], [0, 0.8]);
    } else if (frame >= chorus2Start && frame < chorus2Start + fadeFrames) {
      chorusMultiplier = 1 + interpolate(frame, [chorus2Start, chorus2Start + fadeFrames], [0, 0.8]);
    } else {
      chorusMultiplier = 1.8; // サビ中の最大値
    }

    // サビ終了時のフェードアウト (chorus1のみ)
    if (frame >= chorus1End - fadeFrames && frame <= chorus1End) {
      chorusMultiplier = 1 + interpolate(frame, [chorus1End - fadeFrames, chorus1End], [0.8, 0]);
    }
  }

  // サビでのエフェクト強化（BPM計算の前に定義）
  const dynamicIntensity = intensity * (isChorus ? chorusMultiplier * 1.5 : 1);
  const dynamicBpmSyncIntensity = bpmSyncIntensity * (isChorus ? 1.3 : 1);
  // パーティクル数は常に一定（フェードインなし）
  const dynamicParticleCount = particleCount;

  // BPM計算（オフセット適用）
  const adjustedFrame = Math.max(0, frame - bpmOffset);
  const framesPerBeat = (60 / bpm) * fps;
  const beatProgress = (adjustedFrame % framesPerBeat) / framesPerBeat;

  // ビートに合わせたパルス効果（調整可能・サビで強化）
  const pulseEffect = interpolate(
    beatProgress,
    [0, 0.1, 0.3, 1],
    [0, 1 * dynamicBpmSyncIntensity, 0.2 * dynamicBpmSyncIntensity, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 花びら（元のSeamlessEffectsと同じ）
  const petals: Petal[] = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const scaleFactor = height / 1080;
      const size = (8 + random(`petal-size-${i}`) * 12) * scaleFactor;
      const totalHeight = height + size * 2;

      const desiredSpeed = 0.3 + random(`petal-fall-${i}`) * 0.7;
      const possibleCycles = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

      const targetSpeed = desiredSpeed;
      const idealCycles = (targetSpeed * durationInFrames * speed) / totalHeight;

      const closestCycle = possibleCycles.reduce((prev, curr) => {
        return Math.abs(curr - idealCycles) < Math.abs(prev - idealCycles) ? curr : prev;
      });

      const quantizedFallSpeed = (totalHeight * closestCycle) / (durationInFrames * speed);

      return {
        id: i,
        x: random(`petal-x-${i}`) * width,
        initialY: random(`petal-y-${i}`) * totalHeight,
        size,
        rotation: random(`petal-rot-${i}`) * 360,
        rotationSpeed: 0.5 + random(`petal-rot-speed-${i}`) * 2,
        fallSpeed: quantizedFallSpeed,
        swayAmplitude: (20 + random(`petal-sway-${i}`) * 50) * scaleFactor,
        swayFrequency: 0.01 + random(`petal-sway-freq-${i}`) * 0.02,
        phase: random(`petal-phase-${i}`) * Math.PI * 2,
        color: colors[Math.floor(random(`petal-color-${i}`) * colors.length)],
        opacity: 0.4 + random(`petal-opacity-${i}`) * 0.4,
      };
    });
  }, [particleCount, width, height, colors, speed, durationInFrames]);

  // スパークル（BPMベースで点滅速度を計算）
  const sparkleCount = Math.floor(dynamicParticleCount / 2.5);
  const sparkles = React.useMemo(() => {
    // BPMから基本の点滅速度を計算
    // 1ビートで1回点滅させる基本速度
    const baseTwinkleSpeed = (2 * Math.PI * bpm) / (60 * fps);

    const allSparkles = Array.from({ length: sparkleCount }, (_, i) => {
      const x = random(`ps-sparkle-x-${i}`) * width;
      const y = random(`ps-sparkle-y-${i}`) * height;

      // 顔のあたり（中央上部）を避ける判定
      // 中央: width/2 ± 30%, 上部: 0 ~ height*0.4
      const centerX = width / 2;
      const faceZoneLeft = centerX - width * 0.3;
      const faceZoneRight = centerX + width * 0.3;
      const faceZoneTop = 0;
      const faceZoneBottom = height * 0.4;

      const isInFaceZone = x >= faceZoneLeft && x <= faceZoneRight && y >= faceZoneTop && y <= faceZoneBottom;

      // 顔エリアの場合、70%の確率でスキップ
      if (isInFaceZone && random(`ps-face-filter-${i}`) < 0.7) {
        return null;
      }

      return {
        id: i,
        x,
        y,
        size: (4 + random(`ps-sparkle-size-${i}`) * 6) * (height / 1080),
        // BPMベースの速度（±30%のランダム性を持たせる）
        twinkleSpeed: baseTwinkleSpeed * (0.7 + random(`ps-sparkle-twinkle-${i}`) * 0.6),
        phase: random(`ps-sparkle-phase-${i}`) * Math.PI * 2,
        // ランダム浮遊用のパラメータ（ゆっくり）
        driftSpeedX: 0.02 + random(`ps-drift-x-${i}`) * 0.03, // 0.02〜0.05 (ゆっくり)
        driftSpeedY: 0.015 + random(`ps-drift-y-${i}`) * 0.025, // 0.015〜0.04 (ゆっくり)
        driftAmplitudeX: (15 + random(`ps-drift-amp-x-${i}`) * 25) * (width / 2048), // 15〜40px (小さめ)
        driftAmplitudeY: (10 + random(`ps-drift-amp-y-${i}`) * 20) * (height / 2048), // 10〜30px (小さめ)
        driftPhaseX: random(`ps-drift-phase-x-${i}`) * Math.PI * 2,
        driftPhaseY: random(`ps-drift-phase-y-${i}`) * Math.PI * 2,
      };
    });

    // nullを除外
    return allSparkles.filter((s) => s !== null) as any[];
  }, [sparkleCount, width, height, bpm, fps, dynamicParticleCount]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* BPM同期ビートインジケーター（タイミング確認用） */}
      {showBeatIndicator && (
        <>
          {/* 画面全体フラッシュ（ビートの瞬間に赤く光る） */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: `rgba(255, 0, 0, ${pulseEffect * 0.3})`,
              border: `${pulseEffect * 20}px solid rgba(255, 0, 0, ${pulseEffect * 0.8})`,
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />

          {/* 大きな「BEAT」テキスト */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 200 + pulseEffect * 100,
              fontWeight: 'bold',
              color: '#FF0000',
              opacity: pulseEffect * 0.9,
              textShadow: `0 0 ${50 + pulseEffect * 100}px #FF0000`,
              zIndex: 10000,
              pointerEvents: 'none',
            }}
          >
            BEAT
          </div>

          {/* カウントダウンバー（次のビートまでの時間） */}
          <div
            style={{
              position: 'absolute',
              bottom: 50,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 600,
              height: 40,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: 20,
              overflow: 'hidden',
              border: '3px solid #FF0000',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                width: `${beatProgress * 100}%`,
                height: '100%',
                backgroundColor: '#FF0000',
                boxShadow: `0 0 30px #FF0000`,
              }}
            />
          </div>

          {/* BPM情報テキスト */}
          <div
            style={{
              position: 'absolute',
              top: 30,
              right: 30,
              fontSize: 40,
              fontWeight: 'bold',
              color: '#FFFFFF',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: '10px 20px',
              borderRadius: 10,
              textShadow: '0 0 10px #000',
              zIndex: 10000,
            }}
          >
            BPM: {bpm} | Offset: {bpmOffset}
          </div>
        </>
      )}

      {/* 花びら（通常の落下アニメーション、BPM同期なし） */}
      {showPetals && petals.map((p) => {
        const progress = (frame * speed * p.fallSpeed) / (height + p.size * 2);
        const loopedY = ((p.initialY + progress * (height + p.size * 2)) % (height + p.size * 2)) - p.size;
        const swayX = Math.sin((frame * speed * p.swayFrequency) + p.phase) * p.swayAmplitude;
        const currentRotation = p.rotation + frame * speed * p.rotationSpeed;

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x + swayX,
              top: loopedY,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: '50% 0% 50% 50%',
              transform: `rotate(${currentRotation}deg)`,
              opacity: p.opacity * intensity,
              boxShadow: `0 0 ${p.size}px ${p.color}`,
            }}
          />
        );
      })}

      {/* スパークル（BPM同期で明るさ増加 + ランダム浮遊） */}
      {showSparkles && sparkles.map((s) => {
        // ビートタイミングをベースに各パーティクルの位相でずらす
        // beatProgressは0→1で進行、sin波で-1→1に変換して0→1にスケール
        const baseIntensity = (Math.sin(beatProgress * Math.PI * 2 + s.phase) + 1) / 2;

        // ビートのタイミングでパルス効果を追加（棒と完全同期）
        const twinkle = baseIntensity * 0.6 + pulseEffect * 0.4;

        // サイズもビートに合わせて変化
        const sizeBoost = 1 + pulseEffect * 0.3;

        // ランダム浮遊運動（ゆっくり）
        const driftX = Math.sin(frame * s.driftSpeedX + s.driftPhaseX) * s.driftAmplitudeX;
        const driftY = Math.sin(frame * s.driftSpeedY + s.driftPhaseY) * s.driftAmplitudeY;

        return (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              left: s.x + driftX,
              top: s.y + driftY,
              width: s.size * sizeBoost,
              height: s.size * sizeBoost,
              backgroundColor: '#FFD700',
              borderRadius: '50%',
              opacity: twinkle * dynamicIntensity * 0.8,
              boxShadow: `0 0 ${s.size * 2 * sizeBoost}px #FFFACD, 0 0 ${s.size * 4 * sizeBoost}px #FFD700`,
            }}
          />
        );
      })}
    </div>
  );
};
