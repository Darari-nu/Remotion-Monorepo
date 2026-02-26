import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

// 単語ごとのタイミング情報（キネティックタイポグラフィ用）
export const WordSchema = z.object({
    word: z.string().describe("単語テキスト"),
    start: z.number().describe("開始時間 (秒)"),
    end: z.number().describe("終了時間 (秒)"),
}).describe("単語データ");

// 歌詞の1行データ
export const LyricLineSchema = z.object({
    text: z.string().describe("歌詞テキスト"),
    start: z.number().describe("開始時間 (秒)"),
    end: z.number().describe("終了時間 (秒)"),
    words: z.array(WordSchema).optional().describe("単語レベルのタイミング（詳細アニメーション用）"),
    backgroundImage: z.string().optional().describe("背景画像 (public/images/内のファイル名)"),
}).describe("歌詞行データ");

// アニメーションの種類
export const AnimationTypeSchema = z.enum(['fade', 'slide', 'scale', 'none'])
    .describe("アニメーションの種類 (フェード, スライド, スケール, なし)");

// 位置設定
export const PositionSchema = z.object({
    vertical: z.enum(['top', 'center', 'bottom']).default('center').describe("縦位置 (上/中/下)"),
    offsetX: z.number().default(0).describe("横オフセット (px)"),
    offsetY: z.number().default(0).describe("縦オフセット (px)"),
}).describe("配置設定");

// スタイル設定
export const StyleSchema = z.object({
    fontFamily: z.string().default('sans-serif').describe("フォントファミリ"),
    fontSize: z.number().min(10).max(200).default(60).describe("文字サイズ (px)"),
    fontWeight: z.union([z.number(), z.string()]).default(700).describe("文字の太さ"),
    color: zColor().default('#ffffff').describe("文字色"),
    backgroundColor: zColor().default('transparent').describe("背景色"),
    stroke: z.boolean().default(true).describe("文字の縁取り"),
    shadow: z.boolean().default(true).describe("ドロップシャドウ"),
}).describe("スタイル設定");

// アニメーション詳細設定（キネティック用）
export const AnimationConfigSchema = z.object({
    type: AnimationTypeSchema.default('fade'),
    stagger: z.number().min(0).max(1).default(0.05).describe("文字ごとの出現遅延 (秒)"),
    springDamping: z.number().min(0).max(50).default(12).describe("バネの減衰 (揺れ具合)"),
    springStiffness: z.number().min(0).max(500).default(100).describe("バネの硬さ (速さ)"),
}).describe("アニメーション詳細設定");

// Composition全体のPropsスキーマ
export const CompositionPropsSchema = z.object({
    audioSrc: z.string().describe("音声ファイルパス"),
    lyrics: z.array(LyricLineSchema).describe("歌詞データ"),
    position: PositionSchema,
    style: StyleSchema,
    animation: AnimationConfigSchema,
    durationInFrames: z.number().optional(),
});

export type CompositionProps = z.infer<typeof CompositionPropsSchema>;
export type LyricLine = z.infer<typeof LyricLineSchema>;
export type Word = z.infer<typeof WordSchema>;

// Dynamic Lyric Video Schema
export const LyricEventSchema = z.object({
    text: z.string().describe("歌詞テキスト"),
    startFrame: z.number().describe("開始フレーム"),
    durationFrames: z.number().describe("表示フレーム数"),
    position: z.enum(['center', 'top', 'bottom', 'left', 'right']).optional().describe("表示位置"),
    writingMode: z.enum(['horizontal-tb', 'vertical-rl']).optional().describe("縦書き/横書き"),
    fontSize: z.number().optional().describe("文字サイズ"),
}).describe("歌詞イベントデータ");

export const DynamicLyricVideoPropsSchema = z.object({
    audioSrc: z.string().describe("音声ファイルパス"),
    lyrics: z.array(LyricEventSchema).describe("歌詞イベント配列"),
    backgroundColor: zColor().optional().describe("背景色"),
    focusLinesColor: zColor().optional().describe("集中線の色"),
    showFocusLines: z.boolean().optional().describe("集中線を表示"),
    showSlashingBars: z.boolean().optional().describe("斜め帯を表示"),
    showCenterBox: z.boolean().optional().describe("中央矩形を表示"),
    slashStartFrame: z.number().optional().describe("斜め帯開始フレーム"),
    slashEndFrame: z.number().optional().describe("斜め帯終了フレーム"),
});

export type DynamicLyricVideoProps = z.infer<typeof DynamicLyricVideoPropsSchema>;
export type LyricEvent = z.infer<typeof LyricEventSchema>;
