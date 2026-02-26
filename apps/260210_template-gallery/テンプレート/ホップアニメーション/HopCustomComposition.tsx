import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { AbsoluteFill } from "remotion";
import { HopAnimation } from "./HopAnimation";

// パラメータのスキーマ定義
export const hopAnimationSchema = z.object({
    text: z.string().describe("表示するテキスト"),

    // アニメーション設定グループ
    hopHeight: z.number().min(0).max(300).describe("跳ねる高さ (px)"),
    hopDuration: z.number().min(5).max(60).describe("跳ねる時間 (frames)"),
    staggerDelay: z.number().min(0).max(10).describe("文字ごとの遅延 (frames)"),
    bounceEffect: z.boolean().describe("バウンス効果 (着地時の弾み)"),

    // 変形設定グループ
    rotation: z.number().min(-360).max(360).describe("回転角度 (deg)"),
    scale: z.number().min(0.5).max(3).step(0.1).describe("拡大倍率"),

    // 色設定グループ
    color: zColor().describe("基本の文字色"),
    highlightColor: zColor().describe("ハイライト色 (頂点時)"),

    // 背景設定グループ
    backgroundColor: zColor().default("#111111").describe("背景色"),
});

// コンポーネント
export const HopCustomComposition: React.FC<z.infer<typeof hopAnimationSchema>> = (props) => {
    return (
        <AbsoluteFill
            style={{
                backgroundColor: props.backgroundColor,
            }}
        >
            {/* コンテンツレイヤー */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Arial, sans-serif",
                    fontSize: 80,
                }}
            >
                <HopAnimation
                    text={props.text}
                    startFrame={10}
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
        </AbsoluteFill>
    );
};
