import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { HopAnimation } from "./HopAnimation";

// Google Fonts（人気の日本語対応フォント）
import { loadFont as loadNotoSansJP } from "@remotion/google-fonts/NotoSansJP";
import { loadFont as loadMPlusRounded1c } from "@remotion/google-fonts/MPlusRounded1c";
import { loadFont as loadZenMaruGothic } from "@remotion/google-fonts/ZenMaruGothic";

// フォントマッピング
const fontFamilyMap: Record<string, string> = {
  "Noto Sans JP": loadNotoSansJP().fontFamily,
  "M PLUS Rounded 1c": loadMPlusRounded1c().fontFamily,
  "Zen Maru Gothic": loadZenMaruGothic().fontFamily,
  "Arial": "Arial, sans-serif",
  "System": "system-ui, sans-serif",
};

// ===========================================
// リリックビデオ用テンプレートスキーマ
// ===========================================
export const hopLyricTemplateSchema = z.object({
  // === テキスト設定 ===
  text: z.string().default("歌詞テキスト").describe("歌詞テキスト"),

  // === フォント設定 ===
  fontFamily: z.enum([
    "Noto Sans JP",
    "M PLUS Rounded 1c",
    "Zen Maru Gothic",
    "Arial",
    "System",
  ]).default("Noto Sans JP").describe("フォント"),
  fontSize: z.number().min(20).max(200).step(2).default(72).describe("文字サイズ"),
  fontWeight: z.enum(["normal", "bold", "100", "300", "500", "700", "900"])
    .default("bold").describe("文字の太さ"),
  letterSpacing: z.number().min(-20).max(50).step(1).default(2).describe("文字間隔"),

  // === テキスト配置 ===
  textAlign: z.enum(["left", "center", "right"]).default("center").describe("横位置"),
  verticalAlign: z.enum(["top", "center", "bottom"]).default("center").describe("縦位置"),
  offsetX: z.number().min(-500).max(500).step(5).default(0).describe("横オフセット"),
  offsetY: z.number().min(-500).max(500).step(5).default(0).describe("縦オフセット"),

  // === アニメーション設定 ===
  startFrame: z.number().min(0).max(300).step(1).default(10).describe("開始フレーム"),
  hopHeight: z.number().min(0).max(300).step(5).default(60).describe("跳ねる高さ"),
  hopDuration: z.number().min(5).max(60).step(1).default(20).describe("跳ねる時間"),
  staggerDelay: z.number().min(0).max(15).step(1).default(3).describe("文字ごとの遅延"),
  bounceEffect: z.boolean().default(true).describe("バウンス効果"),
  rotation: z.number().min(-45).max(45).step(1).default(0).describe("回転角度"),
  scale: z.number().min(0.8).max(2).step(0.1).default(1.2).describe("拡大率"),

  // === 色設定 ===
  color: zColor().default("#ffffff").describe("文字色"),
  highlightColor: zColor().default("#ffcc00").describe("ハイライト色"),

  // === テキスト効果 ===
  textShadowEnabled: z.boolean().default(true).describe("影を有効化"),
  textShadowColor: zColor().default("#000000").describe("影の色"),
  textShadowBlur: z.number().min(0).max(30).step(1).default(10).describe("影のぼかし"),
  textShadowOffsetX: z.number().min(-20).max(20).step(1).default(2).describe("影の横位置"),
  textShadowOffsetY: z.number().min(-20).max(20).step(1).default(4).describe("影の縦位置"),

  textOutlineEnabled: z.boolean().default(false).describe("縁取りを有効化"),
  textOutlineColor: zColor().default("#000000").describe("縁取りの色"),
  textOutlineWidth: z.number().min(0).max(10).step(0.5).default(2).describe("縁取りの太さ"),

  // === 背景設定 ===
  backgroundColor: zColor().default("#111111").describe("背景色"),
  backgroundImage: z.string().optional().describe("背景画像パス"),
  showBackgroundImage: z.boolean().default(false).describe("背景画像を表示"),
  backgroundImageOpacity: z.number().min(0).max(1).step(0.05).default(0.5).describe("背景画像の透明度"),
  backgroundImageBlur: z.number().min(0).max(20).step(1).default(0).describe("背景のぼかし"),
});

export type HopLyricTemplateProps = z.infer<typeof hopLyricTemplateSchema>;

// ===========================================
// メインコンポーネント
// ===========================================
export const HopLyricTemplate: React.FC<HopLyricTemplateProps> = (props) => {
  // 縦位置のスタイル計算
  const getVerticalAlignStyle = () => {
    switch (props.verticalAlign) {
      case "top": return { alignItems: "flex-start", paddingTop: 100 };
      case "bottom": return { alignItems: "flex-end", paddingBottom: 100 };
      default: return { alignItems: "center" };
    }
  };

  // 横位置のスタイル計算
  const getHorizontalAlignStyle = () => {
    switch (props.textAlign) {
      case "left": return { justifyContent: "flex-start", paddingLeft: 80 };
      case "right": return { justifyContent: "flex-end", paddingRight: 80 };
      default: return { justifyContent: "center" };
    }
  };

  // テキストシャドウの計算
  const getTextShadow = () => {
    if (!props.textShadowEnabled) return "none";
    return `${props.textShadowOffsetX}px ${props.textShadowOffsetY}px ${props.textShadowBlur}px ${props.textShadowColor}`;
  };

  // テキストアウトラインの計算（WebkitTextStroke）
  const getTextOutline = () => {
    if (!props.textOutlineEnabled) return undefined;
    return `${props.textOutlineWidth}px ${props.textOutlineColor}`;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: props.backgroundColor }}>
      {/* 背景画像レイヤー */}
      {props.backgroundImage && props.showBackgroundImage && (
        <Img
          src={props.backgroundImage.startsWith("http")
            ? props.backgroundImage
            : staticFile(props.backgroundImage)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: props.backgroundImageOpacity,
            filter: props.backgroundImageBlur > 0
              ? `blur(${props.backgroundImageBlur}px)`
              : undefined,
          }}
        />
      )}

      {/* テキストレイヤー */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          ...getVerticalAlignStyle(),
          ...getHorizontalAlignStyle(),
        }}
      >
        <div
          style={{
            transform: `translate(${props.offsetX}px, ${props.offsetY}px)`,
            fontFamily: fontFamilyMap[props.fontFamily] || props.fontFamily,
            fontSize: props.fontSize,
            fontWeight: props.fontWeight,
            letterSpacing: props.letterSpacing,
            textShadow: getTextShadow(),
            WebkitTextStroke: getTextOutline(),
          }}
        >
          <HopAnimation
            text={props.text}
            startFrame={props.startFrame}
            params={{
              hopHeight: props.hopHeight,
              hopDuration: props.hopDuration,
              staggerDelay: props.staggerDelay,
              bounceEffect: props.bounceEffect,
              rotation: props.rotation,
              scale: props.scale,
              color: props.color,
              highlightColor: props.highlightColor,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
