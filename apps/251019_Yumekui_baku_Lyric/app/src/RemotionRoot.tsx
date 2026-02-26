// ========================================
// Remotion Root (Skia 初期化後に registerRoot から呼び出される)
// ========================================

import React, { useEffect, useState } from "react";
import { AbsoluteFill, Composition, staticFile, continueRender, delayRender } from "remotion";
import { RootComposition } from "./RootComposition";
import {
  parseBeats,
  parseChorusSections,
  parseOnsets,
  parseLyricsSRT,
  parseAnalysisSummary,
  parseMelody,
  parseSegments,
  parseDownbeats,
} from "./lib/csv";
import type {
  AppConfig,
  Beat,
  Chorus,
  Onset,
  LyricChar,
  AnalysisSummary,
  Melody,
  Segment,
  Downbeat,
} from "./lib/types";
import { z } from "zod";

export const inputPropsSchema = z.object({
  dataDir: z.string().default("data"),
  assetsDir: z.string().default("assets"),
  configPath: z.string().default("config/app.config.json"),
});

export type InputProps = z.infer<typeof inputPropsSchema>;

export const DEFAULT_CONFIG: AppConfig = {
  width: 1920,
  height: 1080,
  fps: 30,
  theme: {
    palette: {
      indigo: "#0B2545",
      sumi: "#1B1B1B",
      gold: "#D1B67A",
      milk: "#F3F1EA",
      accentPink: "#E8A2C8",
    },
    grainOpacity: 0.2,
    fontFamily: "Noto Serif JP",
  },
  lyric: {
    baselineY: 0,
    fontSize: 265,
    fontSizeChorus: 312,
    letterSpacing: 40,
    glyphWidthRatio: 0.78,
    fontWeight: 900,
    ruby: false,
    stroke: { color: "rgba(0,0,0,0.35)", width: 3, blur: 2 },
    shadow: { color: "rgba(209,182,122,0.2)", offsetY: 4 },
    fadeIn: 0.08,
    fadeOut: 0.3,
  },
  beat: { scaleMin: 1.0, scaleMax: 1.06, tripletDelayMs: 20 },
  particle: { normalRate: 30, chorusMultiplier: 1.3 },
  exposure: { normal: 0.0, chorus: 0.2, max: 0.4 },
  transition: { segmentDuration: 0.3, damping: 200 },
  onset: { threshold: 0.5, flashDuration: 0.08 },
  fallback: { useBeatSplitWhenSrtMissing: true, beatSubdivision: 2 },
};

const DataLoader: React.FC<InputProps> = ({ dataDir, configPath, assetsDir }) => {
  const [data, setData] = useState<{
    config: AppConfig;
    beats: Beat[];
    choruses: Chorus[];
    onsets: Onset[];
    lyrics: LyricChar[];
    melodies: Melody[];
    segments: Segment[];
    downbeats: Downbeat[];
    summary: AnalysisSummary;
  } | null>(null);

  useEffect(() => {
    const handle = delayRender();

    (async () => {
      try {
        let config: AppConfig;
        try {
          const configRes = await fetch(staticFile(configPath));
          config = await configRes.json();
        } catch (err) {
          console.warn("Config file not found, using defaults:", err);
          config = DEFAULT_CONFIG;
        }

        const [beatsRaw, chorusRaw, onsetsRaw, lyricsRaw, summaryRaw, melodyRaw, segmentsRaw, downbeatsRaw] =
          await Promise.all([
            fetch(staticFile(`${dataDir}/beats.csv`)).then((r) => r.text()),
            fetch(staticFile(`${dataDir}/chorus_sections.csv`)).then((r) => r.text()),
            fetch(staticFile(`${dataDir}/loudness_onset.csv`)).then((r) => r.text()),
            fetch(staticFile(`${dataDir}/lyrics_char_provisional.srt`)).then((r) => r.text()),
            fetch(staticFile(`${dataDir}/analysis_summary.csv`)).then((r) => r.text()),
            fetch(staticFile(`${dataDir}/melody_f0.csv`)).then((r) => r.text()),
            fetch(staticFile(`${dataDir}/segments.csv`)).then((r) => r.text()),
            fetch(staticFile(`${dataDir}/downbeats.csv`)).then((r) => r.text()),
          ]);

        const beats = parseBeats(beatsRaw);
        const choruses = parseChorusSections(chorusRaw);
        const onsets = parseOnsets(onsetsRaw);
        const lyrics = parseLyricsSRT(lyricsRaw);
        const summary = parseAnalysisSummary(summaryRaw);
        const melodies = parseMelody(melodyRaw);
        const segments = parseSegments(segmentsRaw);
        const downbeats = parseDownbeats(downbeatsRaw);

        setData({ config, beats, choruses, onsets, lyrics, melodies, segments, downbeats, summary });
        continueRender(handle);
      } catch (error) {
        console.error("Failed to load data:", error);
        continueRender(handle);
      }
    })();
  }, [dataDir, configPath]);

  if (!data) {
    return (
      <AbsoluteFill style={{ backgroundColor: DEFAULT_CONFIG.theme.palette.sumi }} />
    );
  }

  return (
    <RootComposition
      config={data.config}
      beats={data.beats}
      choruses={data.choruses}
      onsets={data.onsets}
      lyrics={data.lyrics}
      melodies={data.melodies}
      segments={data.segments}
      downbeats={data.downbeats}
      assetsDir={assetsDir}
    />
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RootComposition"
      component={DataLoader}
      durationInFrames={300}
      fps={DEFAULT_CONFIG.fps}
      width={DEFAULT_CONFIG.width}
      height={DEFAULT_CONFIG.height}
      schema={inputPropsSchema}
      defaultProps={{
        dataDir: "data",
        assetsDir: "assets",
        configPath: "config/app.config.json",
      }}
      calculateMetadata={async ({ props }) => {
        const { dataDir, configPath } = props;

        try {
          const [{ readFile }, pathModule] = await Promise.all([
            import(
              /* webpackIgnore: true */
              "fs/promises"
            ) as Promise<typeof import("fs/promises")>,
            import(
              /* webpackIgnore: true */
              "path"
            ) as Promise<typeof import("path")>,
          ]);

          const publicDir = pathModule.join(process.cwd(), "public");

          const configFilePath = pathModule.isAbsolute(configPath)
            ? configPath
            : pathModule.join(process.cwd(), configPath);

          let config: AppConfig;
          try {
            const configRaw = await readFile(configFilePath, "utf-8");
            config = JSON.parse(configRaw) as AppConfig;
          } catch (configError) {
            console.warn("⚠️ Config file not found in calculateMetadata, using defaults:", configError);
            config = DEFAULT_CONFIG;
          }

          const summaryPath = pathModule.join(publicDir, dataDir, "analysis_summary.csv");
          const summaryRaw = await readFile(summaryPath, "utf-8");
          const summary = parseAnalysisSummary(summaryRaw);

          const durationInFrames = Math.ceil(summary.duration_sec * config.fps);

          console.log(`✅ Dynamic duration: ${summary.duration_sec}s = ${durationInFrames} frames (fps: ${config.fps})`);

          return {
            durationInFrames,
            fps: config.fps,
          };
        } catch (error) {
          console.error("⚠️ Failed to calculate metadata:", error);
          const fallbackDuration = 239.48;
          console.warn(`Falling back to ${fallbackDuration}s at ${DEFAULT_CONFIG.fps}fps`);
          return {
            durationInFrames: Math.ceil(fallbackDuration * DEFAULT_CONFIG.fps),
            fps: DEFAULT_CONFIG.fps,
          };
        }
      }}
    />
  );
};
