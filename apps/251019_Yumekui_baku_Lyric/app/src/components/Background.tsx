// ========================================
// 背景レイヤー（SceneId に応じた映像素材切り替え）
// ========================================

import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, staticFile, Video } from "remotion";
import type { AppConfig, SceneId, Downbeat } from "../lib/types";
import { easeInOut } from "../lib/easing";

interface BackgroundProps {
  config: AppConfig;
  sceneId: SceneId;
  nearestDownbeat: Downbeat | null;
  previousSceneId: SceneId | null;
  assetsDir: string;
}

// SceneId ごとの背景色設定（映像素材がないときのフォールバック）
const SCENE_COLORS: Record<SceneId, { primary: string; secondary: string }> = {
  K1: { primary: "#0B2545", secondary: "#1B1B1B" }, // 心音: 藍→墨
  K2: { primary: "#1B1B1B", secondary: "#0B2545" }, // 鼓動: 墨→藍
  K3: { primary: "#2C3E50", secondary: "#34495E" }, // 胎内: 灰青
  K4: { primary: "#D1B67A", secondary: "#0B2545" }, // 雨融合: 金→藍
  K5: { primary: "#E8A2C8", secondary: "#D1B67A" }, // 祈りの手: 桃→金
  K6: { primary: "#1B1B1B", secondary: "#2C2C2C" }, // バク影: 深墨
  K7: { primary: "#F3F1EA", secondary: "#D1B67A" }, // 浄化: 乳白→金
  K8: { primary: "#0B2545", secondary: "#E8A2C8" }, // 静寂: 藍→桃
  K9: { primary: "#1B1B1B", secondary: "#0B2545" }, // 喉の言葉: 墨→藍
  K10: { primary: "#F3F1EA", secondary: "#FFFFFF" }, // 食べ尽くす: 乳白→白
};

// SceneId ごとの映像素材パス（素材が揃ったら使用）
// 使い方: app/assets/video/K01/ に scene.mp4 を配置したら、下記のコメントアウトを外す
const VIDEO_FILE_NAME = "scene.mp4";

/**
 * シーン背景を描画するサブコンポーネント
 * 素材がある場合は Video、ない場合はグラデーション
 */
const SceneLayer: React.FC<{
  sceneId: SceneId;
  opacity: number;
  assetsDir: string;
}> = ({ sceneId, opacity, assetsDir }) => {
  const [fallback, setFallback] = React.useState(false);
  const sceneColor = SCENE_COLORS[sceneId];

  const numericId = Number.parseInt(sceneId.slice(1), 10);
  const folder = Number.isNaN(numericId)
    ? sceneId
    : `K${numericId.toString().padStart(2, "0")}`;
  const videoRelativePath = `${assetsDir}/video/${folder}/${VIDEO_FILE_NAME}`;

  const layerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    opacity,
  };

  const renderFallback = () => (
    <div
      style={{
        ...layerStyle,
        background: `linear-gradient(135deg, ${sceneColor.primary} 0%, ${sceneColor.secondary} 50%, ${sceneColor.primary} 100%)`,
      }}
    />
  );

  return fallback ? (
    renderFallback()
  ) : (
    <div style={layerStyle}>
      {renderFallback()}
      <Video
        src={staticFile(videoRelativePath)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        muted
        startFrom={0}
        onError={() => setFallback(true)}
      />
    </div>
  );
};

export const Background: React.FC<BackgroundProps> = ({
  config,
  sceneId,
  nearestDownbeat,
  previousSceneId,
  assetsDir,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // トランジション状態の計算
  // nearestDownbeat がシーン切り替えのトリガー
  const { isTransitioning, oldSceneId, newSceneId, progress } = useMemo(() => {
    if (!nearestDownbeat || !previousSceneId) {
      return {
        isTransitioning: false,
        oldSceneId: sceneId,
        newSceneId: sceneId,
        progress: 1,
      };
    }

    const timeSinceDownbeat = currentTime - nearestDownbeat.time_sec;
    const transitionDuration = config.transition.segmentDuration;

    // Downbeat から 0.3s 以内ならトランジション中
    if (timeSinceDownbeat >= 0 && timeSinceDownbeat < transitionDuration) {
      // トランジション中: 旧シーンから新シーンへ
      const progress = interpolate(
        timeSinceDownbeat,
        [0, transitionDuration],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: easeInOut,
        }
      );

      return {
        isTransitioning: true,
        oldSceneId: previousSceneId,
        newSceneId: sceneId,
        progress,
      };
    } else {
      // トランジション完了
      return {
        isTransitioning: false,
        oldSceneId: sceneId,
        newSceneId: sceneId,
        progress: 1,
      };
    }
  }, [nearestDownbeat, currentTime, config.transition.segmentDuration, sceneId, previousSceneId]);

  // 各レイヤーの opacity 計算
  const oldLayerOpacity = isTransitioning ? interpolate(progress, [0, 1], [1, 0]) : 0;
  const newLayerOpacity = interpolate(progress, [0, 1], [0, 1]);

  // デバッグ表示
  const debugStyle: React.CSSProperties = {
    position: "absolute",
    top: 60,
    left: 20,
    color: config.theme.palette.milk,
    fontSize: 18,
    fontFamily: "monospace",
    opacity: 0.4,
    pointerEvents: "none",
    zIndex: 100,
  };

  return (
    <>
      {/* 旧シーンレイヤー（トランジション中のみ） */}
      {isTransitioning && (
        <SceneLayer
          sceneId={oldSceneId}
          opacity={oldLayerOpacity * 0.95}
          assetsDir={assetsDir}
        />
      )}

      {/* 新シーンレイヤー（常時表示） */}
      <SceneLayer
        sceneId={newSceneId}
        opacity={newLayerOpacity * 0.95}
        assetsDir={assetsDir}
      />

      {/* デバッグ情報 */}
      {process.env.NODE_ENV === "development" && (
        <div style={debugStyle}>
          Scene: {sceneId}
          {isTransitioning && (
            <div style={{ fontSize: 14, color: "#E8A2C8" }}>
              Transition: {oldSceneId} → {newSceneId}
              <br />
              Progress: {(progress * 100).toFixed(0)}%
            </div>
          )}
          {nearestDownbeat && (
            <div style={{ fontSize: 14 }}>
              Downbeat: bar {nearestDownbeat.bar_index} @ {nearestDownbeat.time_sec.toFixed(2)}s
            </div>
          )}
        </div>
      )}
    </>
  );
};
