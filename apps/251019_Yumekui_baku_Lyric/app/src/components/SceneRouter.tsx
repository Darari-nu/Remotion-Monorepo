// ========================================
// シーンルーター（K1〜K10 切り替え + Downbeat 同期）
// ========================================

import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Segment, Downbeat, SceneId } from "../lib/types";
import { getCurrentSegment } from "../lib/timing";

interface SceneRouterProps {
  segments: Segment[];
  downbeats: Downbeat[];
  children: (
    sceneId: SceneId,
    nearestDownbeat: Downbeat | null,
    previousSceneId: SceneId | null
  ) => React.ReactNode;
}

// セグメントラベルから SceneId へのマッピング
const SCENE_MAP: Record<string, SceneId[]> = {
  intro: ["K1", "K2"],
  verse: ["K3", "K4", "K5"],
  "pre-chorus": ["K6", "K7"],
  chorus: ["K8", "K9"],
  outro: ["K10"],
};

export const SceneRouter: React.FC<SceneRouterProps> = ({
  segments,
  downbeats,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // 現在のセグメント
  const currentSegment = useMemo(
    () => getCurrentSegment(segments, currentTime),
    [segments, currentTime]
  );

  // シーンを計算するヘルパー関数
  const calculateSceneId = (time: number): SceneId => {
    const segment = getCurrentSegment(segments, time);
    if (!segment) return "K1";

    const scenes = SCENE_MAP[segment.label] || ["K1"];

    // 現在セグメント内の downbeat を列挙
    const segmentDownbeats = downbeats.filter(
      (db) =>
        db.time_sec >= segment.start_sec &&
        db.time_sec < segment.end_sec
    );

    if (segmentDownbeats.length === 0) return scenes[0];

    // 指定時刻より前の最後の downbeat を取得
    const passedDownbeats = segmentDownbeats.filter(
      (db) => db.time_sec <= time
    );

    if (passedDownbeats.length === 0) return scenes[0];

    // セグメント内での downbeat インデックスを計算
    const downbeatIndex = passedDownbeats.length - 1;

    // シーンインデックスを計算（downbeat ごとにローテーション）
    const sceneIndex = Math.floor(
      (downbeatIndex / segmentDownbeats.length) * scenes.length
    );

    return scenes[Math.min(sceneIndex, scenes.length - 1)];
  };

  // 現在のシーンID
  const sceneId: SceneId = useMemo(
    () => calculateSceneId(currentTime),
    [currentTime, currentSegment, downbeats]
  );

  // 最も近い downbeat を探す
  const nearestDownbeat = useMemo(() => {
    const passedDownbeats = downbeats.filter((db) => db.time_sec <= currentTime);
    if (passedDownbeats.length === 0) return null;
    return passedDownbeats[passedDownbeats.length - 1];
  }, [downbeats, currentTime]);

  // 1つ前の downbeat 時点でのシーン ID を計算
  const previousSceneId: SceneId | null = useMemo(() => {
    if (!nearestDownbeat) return null;

    const passedDownbeats = downbeats.filter((db) => db.time_sec <= currentTime);
    if (passedDownbeats.length < 2) return null;

    // 1つ前の downbeat の時刻
    const previousDownbeat = passedDownbeats[passedDownbeats.length - 2];
    return calculateSceneId(previousDownbeat.time_sec);
  }, [nearestDownbeat, downbeats, currentTime]);

  return <>{children(sceneId, nearestDownbeat, previousSceneId)}</>;
};
