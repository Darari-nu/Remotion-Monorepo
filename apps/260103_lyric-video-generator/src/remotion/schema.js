"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositionPropsSchema = exports.AnimationConfigSchema = exports.StyleSchema = exports.PositionSchema = exports.AnimationTypeSchema = exports.LyricLineSchema = exports.WordSchema = void 0;
const zod_1 = require("zod");
const zod_types_1 = require("@remotion/zod-types");
// 単語ごとのタイミング情報（キネティックタイポグラフィ用）
exports.WordSchema = zod_1.z.object({
    word: zod_1.z.string().describe("単語テキスト"),
    start: zod_1.z.number().describe("開始時間 (秒)"),
    end: zod_1.z.number().describe("終了時間 (秒)"),
}).describe("単語データ");
// 歌詞の1行データ
exports.LyricLineSchema = zod_1.z.object({
    text: zod_1.z.string().describe("歌詞テキスト"),
    start: zod_1.z.number().describe("開始時間 (秒)"),
    end: zod_1.z.number().describe("終了時間 (秒)"),
    words: zod_1.z.array(exports.WordSchema).optional().describe("単語レベルのタイミング（詳細アニメーション用）"),
    backgroundImage: zod_1.z.string().optional().describe("背景画像 (public/images/内のファイル名)"),
}).describe("歌詞行データ");
// アニメーションの種類
exports.AnimationTypeSchema = zod_1.z.enum(['fade', 'slide', 'scale', 'none'])
    .describe("アニメーションの種類 (フェード, スライド, スケール, なし)");
// 位置設定
exports.PositionSchema = zod_1.z.object({
    vertical: zod_1.z.enum(['top', 'center', 'bottom']).default('center').describe("縦位置 (上/中/下)"),
    offsetX: zod_1.z.number().default(0).describe("横オフセット (px)"),
    offsetY: zod_1.z.number().default(0).describe("縦オフセット (px)"),
}).describe("配置設定");
// スタイル設定
exports.StyleSchema = zod_1.z.object({
    fontFamily: zod_1.z.string().default('sans-serif').describe("フォントファミリ"),
    fontSize: zod_1.z.number().min(10).max(200).default(60).describe("文字サイズ (px)"),
    fontWeight: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).default(700).describe("文字の太さ"),
    color: (0, zod_types_1.zColor)().default('#ffffff').describe("文字色"),
    backgroundColor: (0, zod_types_1.zColor)().default('transparent').describe("背景色"),
    stroke: zod_1.z.boolean().default(true).describe("文字の縁取り"),
    shadow: zod_1.z.boolean().default(true).describe("ドロップシャドウ"),
}).describe("スタイル設定");
// アニメーション詳細設定（キネティック用）
exports.AnimationConfigSchema = zod_1.z.object({
    type: exports.AnimationTypeSchema.default('fade'),
    stagger: zod_1.z.number().min(0).max(1).default(0.05).describe("文字ごとの出現遅延 (秒)"),
    springDamping: zod_1.z.number().min(0).max(50).default(12).describe("バネの減衰 (揺れ具合)"),
    springStiffness: zod_1.z.number().min(0).max(500).default(100).describe("バネの硬さ (速さ)"),
}).describe("アニメーション詳細設定");
// Composition全体のPropsスキーマ
exports.CompositionPropsSchema = zod_1.z.object({
    audioSrc: zod_1.z.string().describe("音声ファイルパス"),
    lyrics: zod_1.z.array(exports.LyricLineSchema).describe("歌詞データ"),
    position: exports.PositionSchema,
    style: exports.StyleSchema,
    animation: exports.AnimationConfigSchema,
});
