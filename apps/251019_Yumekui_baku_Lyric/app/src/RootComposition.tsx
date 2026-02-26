// ========================================
// ルートコンポジション: 夢くいバク リリックビデオ
// ========================================

import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Background } from "./components/Background";
import { LyricLine } from "./components/LyricLine";
import { EffectsLayer } from "./components/EffectsLayer";
import { SceneRouter } from "./components/SceneRouter";
import { Watermark } from "./components/Watermark";
import type {
  AppConfig,
  Beat,
  Chorus,
  Onset,
  LyricChar,
  Melody,
  Segment,
  Downbeat,
} from "./lib/types";

interface RootCompositionProps {
  config: AppConfig;
  beats: Beat[];
  choruses: Chorus[];
  onsets: Onset[];
  lyrics: LyricChar[];
  melodies: Melody[];
  segments: Segment[];
  downbeats: Downbeat[];
  assetsDir: string;
}

export const RootComposition: React.FC<RootCompositionProps> = ({
  config,
  beats,
  choruses,
  onsets,
  lyrics,
  melodies,
  segments,
  downbeats,
  assetsDir,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: config.theme.palette.sumi,
        fontFamily: config.theme.fontFamily,
      }}
    >
      {/* 音声 */}
      <Audio src={staticFile("夢喰いバク.mp3")} />

      {/* シーンルーター経由で背景を描画 */}
      <SceneRouter segments={segments} downbeats={downbeats}>
        {(sceneId, nearestDownbeat, previousSceneId) => (
          <Background
            config={config}
            sceneId={sceneId}
            nearestDownbeat={nearestDownbeat}
            previousSceneId={previousSceneId}
            assetsDir={assetsDir}
          />
        )}
      </SceneRouter>

      {/* エフェクトレイヤー（和紙グレイン、ビート脈動、オンセットフラッシュ） */}
      <EffectsLayer config={config} beats={beats} onsets={onsets} />

      {/* 歌詞レイヤー */}
      <LyricLine
        lyrics={lyrics}
        config={config}
        beats={beats}
        choruses={choruses}
        melodies={melodies}
      />

      {/* ウォーターマーク */}
      <Watermark config={config} />
    </AbsoluteFill>
  );
};
