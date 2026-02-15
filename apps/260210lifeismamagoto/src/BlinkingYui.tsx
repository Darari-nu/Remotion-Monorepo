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

  // 5秒 = 150フレーム (30fps)
  const blinkInterval = 150;
  const blinkDuration = 6; // 0.2秒 = 6フレーム

  // 5秒ごとのサイクル内での位置
  const cycleFrame = frame % blinkInterval;

  // 瞬きアニメーション (0 = 目を開けてる, 1 = 目を閉じてる)
  let blinkProgress = 0;

  if (cycleFrame < blinkDuration / 2) {
    // 閉じていく (0→1)
    blinkProgress = interpolate(cycleFrame, [0, blinkDuration / 2], [0, 1]);
  } else if (cycleFrame < blinkDuration) {
    // 開いていく (1→0)
    blinkProgress = interpolate(cycleFrame, [blinkDuration / 2, blinkDuration], [1, 0]);
  }

  // 瞬き中かどうか（0.5より大きければ閉じた目を表示）
  const showClosedEyes = blinkProgress > 0.5;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!showClosedEyes ? (
        /* 通常の目を開けた画像 */
        <Img
          src={staticFile('Yui_earthkey 20260206.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: opacity,
          }}
        />
      ) : (
        /* 目を閉じた画像 */
        <Img
          src={staticFile('YUi_Closeeye.png')}
          style={{
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
