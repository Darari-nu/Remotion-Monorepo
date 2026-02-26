// ========================================
// ウォーターマーク（クレジット表示）
// ========================================

import React from "react";
import type { AppConfig } from "../lib/types";

interface WatermarkProps {
  config: AppConfig;
}

export const Watermark: React.FC<WatermarkProps> = ({ config }) => {
  const watermarkStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontFamily: config.theme.fontFamily,
    fontSize: 14,
    color: config.theme.palette.milk,
    opacity: 0.6,
    textAlign: "right",
    lineHeight: 1.6,
    pointerEvents: "none",
    textShadow: `0 2px 4px ${config.theme.palette.sumi}`,
  };

  return (
    <div style={watermarkStyle}>
      <div>夢くいバク</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        Lyric Video by Claude Code
      </div>
    </div>
  );
};
