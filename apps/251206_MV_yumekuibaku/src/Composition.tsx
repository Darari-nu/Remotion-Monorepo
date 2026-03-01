import React, { useEffect, useState } from 'react';
import { Composition, useVideoConfig, Sequence, Audio, staticFile, delayRender, continueRender, AbsoluteFill, Video } from 'remotion';
import { Subtitle, subtitleSchema, SubtitleProps } from './Subtitle';
import { KineticLyricEngine } from './KineticLyricEngine';
import { parseSrt, SubtitleItem } from './utils/srtParser';
import { z } from 'zod'; // Import z from zod

// Main Composition Schema: Inherit styling form subtitleSchema
// We want to control the style GLOBALLY for all subtitles in the main video.
// But we don't want to pass 'text' here, as it comes from SRT.
// So we extract the 'style' part.

export const mainCompositionSchema = z.object({
  subtitleStyle: subtitleSchema.shape.style,
});

export const MainVideo: React.FC<z.infer<typeof mainCompositionSchema>> = ({ subtitleStyle }) => {
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();

  // Chorus Constants
  const CHORUS_START_TIME = 64.25; // Adjusted to make "Ne" start at 0.11s
  const VIDEO_DURATION = 29.29;    // From ffmpeg output
  const CHORUS_END_TIME = CHORUS_START_TIME + VIDEO_DURATION;

  useEffect(() => {
    fetch(staticFile('yumeiku.srt'))
      .then((res) => res.text())
      .then((text) => {
        setSubtitles(parseSrt(text));
        continueRender(handle);
      })
      .catch((err) => {
        console.error('Failed to load subtitles', err);
        continueRender(handle);
      });
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={staticFile('yumekuibaku.mp3')} />

      {/* Background Video during Chorus */}
      <Sequence
        from={Math.round(CHORUS_START_TIME * fps)}
        durationInFrames={Math.round(VIDEO_DURATION * fps)}
      >
        <Video src={staticFile('yumekuibaku.mp4')} />
      </Sequence>

      {/* Kinetic Lyrics Overlay during Chorus */}
      <Sequence
        from={Math.round(CHORUS_START_TIME * fps)}
        durationInFrames={Math.round(VIDEO_DURATION * fps)}
      >
        <KineticLyricEngine
          subtitles={subtitles
            .filter(s => s.startTime >= CHORUS_START_TIME && s.startTime < CHORUS_END_TIME)
            .map(s => ({
              ...s,
              startTime: s.startTime - CHORUS_START_TIME,
              endTime: s.endTime - CHORUS_START_TIME,
            }))}
          isTransparent={true}
          seed={42} // Fixed seed for specific look
        />
      </Sequence>

      {/* Normal Subtitles (Hide during Chorus) */}
      {subtitles.map((item) => {
        const durationInSeconds = item.endTime - item.startTime;
        if (durationInSeconds <= 0) return null;

        // Skip if inside chorus window
        // Simple overlapping check: if subtitle overlaps significantly with chorus
        const isChorus = item.startTime >= CHORUS_START_TIME && item.startTime < CHORUS_END_TIME;
        if (isChorus) return null;

        return (
          <Sequence
            key={item.id}
            from={Math.round(item.startTime * fps)}
            durationInFrames={Math.round(durationInSeconds * fps)}
          >
            <Subtitle text={item.text} style={subtitleStyle} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
