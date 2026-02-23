import React from 'react';
import { Img, staticFile, useCurrentFrame, interpolate } from 'remotion';

interface BlinkingYuiProps {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  blur: number;
  opacity: number;
  mixBlendMode: string;
}

export const BlinkingYui: React.FC<BlinkingYuiProps> = ({
  x,
  y,
  scale,
  rotation,
  blur,
  opacity,
  mixBlendMode,
}) => {
  const frame = useCurrentFrame();

  // 10秒 = 300フレーム (30fps)
  const blinkInterval = 300;
  const blinkDuration = 6; // 0.2秒 = 6フレーム
  const firstBlinkDelay = 150; // 最初の瞬きは5秒後 = 150フレーム

  // 最初の瞬きまでの遅延を考慮
  const adjustedFrame = frame - firstBlinkDelay;

  // まだ最初の瞬きタイミングに達していない場合は瞬きなし
  if (adjustedFrame < 0) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Img
          src={staticFile('Yui_earthkey 20260206.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: opacity,
          }}
        />
      </div>
    );
  }

  // 10秒ごとのサイクル内での位置
  const cycleFrame = adjustedFrame % blinkInterval;

  // 瞬きの瞬間だけ目を閉じた画像を表示（中間フレームのみ）
  // blinkDuration = 6フレーム: [0, 1, 2, 3, 4, 5]
  // 閉じた目を表示するのは中央の2フレームのみ: [2, 3]
  const showClosedEyes = cycleFrame >= blinkDuration / 3 && cycleFrame < (blinkDuration * 2) / 3;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* ベース画像（常に表示） */}
      <Img
        src={staticFile('Yui_earthkey 20260206.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: opacity,
        }}
      />

      {/* 瞬き画像（顔の部分だけ、瞬きの時だけ重ねる） */}
      {showClosedEyes && (
        <Img
          src={staticFile('YUi_Closeeye1.png')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: opacity,
          }}
        />
      )}
    </div>
  );
};
