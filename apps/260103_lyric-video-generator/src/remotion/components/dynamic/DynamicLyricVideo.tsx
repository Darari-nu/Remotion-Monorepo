import React from 'react';
import { AbsoluteFill, Audio, Sequence } from 'remotion';
import { FocusLines } from './FocusLines';
import { SlashingBars } from './SlashingBars';
import { CenterBox } from './CenterBox';
import { DynamicLyricText } from './DynamicLyricText';
import { DynamicLyricVideoProps } from '../../schema';

export const DynamicLyricVideo: React.FC<DynamicLyricVideoProps> = ({
  audioSrc,
  lyrics,
  backgroundColor = '#ffffff',
  focusLinesColor = '#e0e0e0',
  showFocusLines = true,
  showSlashingBars = true,
  showCenterBox = true,
  slashStartFrame = 40,
  slashEndFrame = 55,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Background Focus Lines */}
      {showFocusLines && <FocusLines color={focusLinesColor} />}

      {/* Slashing Bars Effect */}
      {showSlashingBars && (
        <SlashingBars startFrame={slashStartFrame} endFrame={slashEndFrame} />
      )}

      {/* Center Box (Intro) */}
      {showCenterBox && <CenterBox startFrame={0} />}

      {/* Lyric Text Sequences */}
      {lyrics.map((lyric, index) => (
        <Sequence
          key={index}
          from={lyric.startFrame}
          durationInFrames={lyric.durationFrames}
        >
          <DynamicLyricText
            text={lyric.text}
            startFrame={0}
            position={lyric.position || 'center'}
            writingMode={lyric.writingMode || 'horizontal-tb'}
            fontSize={lyric.fontSize || 80}
          />
        </Sequence>
      ))}

      {/* Audio */}
      <Audio src={audioSrc} />
    </AbsoluteFill>
  );
};
