import React from "react";
import { Composition } from "remotion";
import { LifeIsmamagotoComposition, lifeIsmamagotoSchema } from "./LifeIsmamagotoComposition";
import { LifeIsmamagotoNoBlink, lifeIsmamagotoNoBlinkSchema } from "./LifeIsmamagotoNoBlink";

const commonProps = {
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
  yuiLayer: {
    show: true,
    opacity: 1,
    x: 72,
    y: 123,
    scale: 0.88,
    rotation: 0,
    blur: 0,
    mixBlendMode: 'normal' as const,
  },
  effectIntensity: 1,
  effectSpeed: 1.23,
  particleCount: 110,
  backgroundColor: 'transparent',
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 瞬きなしバージョン */}
      <Composition
        id="LifeIsmamagoto-NoBlink"
        component={LifeIsmamagotoNoBlink}
        schema={lifeIsmamagotoNoBlinkSchema}
        defaultProps={commonProps}
        durationInFrames={1788}
        fps={30}
        width={2048}
        height={2048}
      />

      {/* 瞬きありバージョン */}
      <Composition
        id="LifeIsmamagoto-WithBlink"
        component={LifeIsmamagotoComposition}
        schema={lifeIsmamagotoSchema}
        defaultProps={commonProps}
        durationInFrames={1788}
        fps={30}
        width={2048}
        height={2048}
      />
    </>
  );
};
