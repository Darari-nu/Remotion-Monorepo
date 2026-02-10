import React from "react";
import { Composition } from "remotion";
import { LifeIsmamagotoComposition, lifeIsmamagotoSchema } from "./LifeIsmamagotoComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LifeIsmamagoto"
        component={LifeIsmamagotoComposition}
        schema={lifeIsmamagotoSchema}
        defaultProps={{
          // 背景レイヤー（カフェ）
          bgLayer: {
            show: true,
            opacity: 0.94,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            blur: 0,
            mixBlendMode: 'normal' as const,
          },
          // Yuiレイヤー
          yuiLayer: {
            show: true,
            opacity: 1,
            x: 27,
            y: 67,
            scale: 0.88,
            rotation: 0,
            blur: 0,
            mixBlendMode: 'normal' as const,
          },
          // エフェクト設定
          effectIntensity: 1,
          effectSpeed: 1.23,
          particleCount: 290,
          backgroundColor: '#ffffff',
        }}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
