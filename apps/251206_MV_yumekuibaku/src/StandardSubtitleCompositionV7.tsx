import React, { useEffect, useState } from 'react';
import {
    AbsoluteFill,
    staticFile,
    Video,
    useVideoConfig,
    Sequence,
} from 'remotion';
import { SharpRevealText } from './SharpRevealText';
import { TitleRevealText } from './TitleRevealText';
import { LyricsAuditComposition } from './LyricsAuditComposition';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

// Define props schema (Copied from V6 but renamed)
// Define schemas for each section style
const baseStyleSchema = z.object({
    文字サイズpx: z.number(),
    文字色: zColor(),
    文字間隔: z.string(),
    行間隔px: z.number(),
    漢字拡大率: z.number(),
    かな拡大率: z.number(),
});

// --- Per-ID Adjustment Schema ---
const adjustmentSchema = z.object({
    startFrame: z.number().default(0).describe('開始F調整'),
    endFrame: z.number().default(0).describe('終了F調整'),
    charDuration: z.number().default(0).describe('文字表示時間(0で全体設定)'),
    scale: z.number().default(1).describe('サイズ倍率'),
    fadeOut: z.number().default(0).describe('フェードアウト時間(F)'),
    position: z.string().optional().describe('位置指定(right/center/left/center-right/center-left)'),
    highlight: z.boolean().default(false).describe('文字の輪郭(黒)'),
});

const v1_ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 1009, 9, 10, 1001, 1002, 1003, 1004, 1005, 1006, 13, 14, 1007, 1008];
const c1_ids = [16, 17, 18, 19, 20];
const v2_ids = [21, 22, 23, 24, 25, 26, 27, 28];
const b_ids = [29, 30, 31, 32, 33, 34];
const c2_ids = [35, 36, 37, 38, 39];
const o_ids = [40, 41, 42, 43, 44, 45, 46, 47, 48, 1048, 49, 1049];

const SUBTITLE_TEXTS: Record<number, string> = {
    0: "午前2時",
    1: "突然の悪夢",
    2: "窓の外は",
    3: "静かな雨音",
    4: "あの子の好きな",
    5: "優しい音",
    6: "耳をすませば さっきの恐怖は",
    7: "まるで",
    8: "バクが",
    1009: "食べちゃったみたい",
    9: "昨日見た",
    10: "寂しそうな横顔",
    1001: "あれは",
    1002: "ボクの",
    1003: "気のせい？",
    1004: "あの子には",
    1005: "叩きつける嵐",
    1006: "じゃなく",
    13: "やさしい",
    14: "雨音だけ",
    1007: "届けば",
    1008: "いいのに",
    16: "ねぇ",
    17: "夢喰いバク もしもいるのなら",
    18: "どうか今夜 あの子の 夢を守って",
    19: "ささくれみたいな 後悔 喉を締める言葉",
    20: "全部 悪い夢にして 食べ尽くして",
    21: "にぎやかな 昼休み",
    22: "すれ違いざま",
    23: "あの子から 感じた 涙の気配",
    24: "振り返って 追いかけたいのに",
    25: "これは 昨日見た 悪夢の続きだ",
    26: "喉から 手が出るほど 願うのに",
    27: "地面に 縫い付けられた ように",
    28: "僕の 足は 動かない",
    29: "今夜",
    30: "僕は バクの背中に またがって",
    31: "ざらつく 後悔の砂嵐を 越える",
    32: "音を",
    33: "なくした あの子の心に",
    34: "産声 みたいな夢を 届けにいこう",
    35: "ねぇ",
    36: "夢喰いバク 聞こえてる？",
    37: "あの子の 泣き声が 夜に溶けてく",
    38: "ボクの声じゃ 届かないから",
    39: "君があの子を 包んであげて",
    40: "朽ちユクだけノ",
    41: "ちいサナはなモ",
    42: "イノるコトバさえ",
    43: "ナくしたくちびルも",
    44: "スベて悪夢にシテ",
    45: "クイ尽くスから",
    46: "どうかアノコの",
    47: "朝が",
    48: "ハレ",
    1048: "渡り",
    49: "まスヨ",
    1049: "ウに…",
};

// Helper to generate key with lyric text
const formatAdjustmentKey = (id: number) => {
    const text = SUBTITLE_TEXTS[id] || '';
    // Sanitize: replace spaces/newlines with _, remove symbols that might break key usage
    const sanitized = text.replace(/[\s\n\u3000]+/g, '_').replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF_]/g, '').slice(0, 15);
    return `id_${id}_${sanitized}`;
};

// Helper to generate default object for Root.tsx
export const generateDefaultAdjustments = (ids: number[]) => {
    const defaultObj: Record<string, any> = {};
    const defaultItem = {
        startFrame: 0,
        endFrame: 0,
        charDuration: 0,
        scale: 1,
        fadeOut: 0,
        highlight: false,
    };
    ids.forEach(id => {
        defaultObj[formatAdjustmentKey(id)] = defaultItem;
    });
    return defaultObj;
};

// Export pre-calculated defaults for Root.tsx
export const defaultAdjustments_Verse1 = generateDefaultAdjustments(v1_ids);
export const defaultAdjustments_Chorus1 = generateDefaultAdjustments(c1_ids);
export const defaultAdjustments_Verse2 = generateDefaultAdjustments(v2_ids);
export const defaultAdjustments_Bridge = generateDefaultAdjustments(b_ids);
export const defaultAdjustments_Chorus2 = generateDefaultAdjustments(c2_ids);
export const defaultAdjustments_Outro = generateDefaultAdjustments(o_ids);

const createAdjustmentGroup = (ids: number[]) => {
    // Relax type to allow ZodDefault wrapped schemas
    const shape: Record<string, z.ZodTypeAny> = {};
    const defaultObj = generateDefaultAdjustments(ids);
    const defaultItem = {
        startFrame: 0,
        endFrame: 0,
        charDuration: 0,
        scale: 1,
        fadeOut: 0,
        highlight: false,
    };

    ids.forEach(id => {
        // Use key with text for visibility in Remotion Studio
        const key = formatAdjustmentKey(id);
        shape[key] = adjustmentSchema.default(defaultItem);
    });
    return z.object(shape).default(defaultObj);
};

export const standardSubtitleV7Schema = z.object({
    // Global Settings
    全体設定: z.object({
        charDuration: z.number().min(1).default(15),
        jitter: z.number().default(10),
        shadowBlur: z.number().default(10),
        shadowColor: zColor().default('rgba(0,0,0,0.8)'),
        strokeWidth: z.number().default(0),
        strokeColor: zColor().default('rgba(0,0,0,0.5)'),
        accentColor: zColor().default('#808080'),
        lineThickness: z.number().default(5),
        boxThickness: z.number().default(5),
        hexagonThickness: z.number().default(5),
    }).default({}),

    // Section Styles (Tabs)
    Aメロ設定: baseStyleSchema.extend({}).default({
        文字サイズpx: 50,
        文字色: '#ffffff',
        文字間隔: '0.4em',
        行間隔px: 200,
        漢字拡大率: 4,
        かな拡大率: 2,
    }),
    Bメロ設定: baseStyleSchema.extend({}).default({
        文字サイズpx: 50,
        文字色: '#ffffff',
        文字間隔: '0.4em',
        行間隔px: 200,
        漢字拡大率: 4,
        かな拡大率: 2,
    }),
    サビ設定: baseStyleSchema.extend({}).default({
        文字サイズpx: 50,
        文字色: '#ff0000', // Example different default
        文字間隔: '0.4em',
        行間隔px: 200,
        漢字拡大率: 4,
        かな拡大率: 2,
    }),
    Cメロ設定: baseStyleSchema.extend({}).default({
        文字サイズpx: 50,
        文字色: '#ccccff',
        文字間隔: '0.4em',
        行間隔px: 200,
        漢字拡大率: 4,
        かな拡大率: 2,
    }),
    Outro設定: baseStyleSchema.extend({}).default({
        文字サイズpx: 50,
        文字色: '#ffffff',
        文字間隔: '0.4em',
        行間隔px: 200,
        漢字拡大率: 4,
        かな拡大率: 2,
    }),
    調整_Verse1: createAdjustmentGroup(v1_ids),
    調整_Chorus1: createAdjustmentGroup(c1_ids),
    調整_Verse2: createAdjustmentGroup(v2_ids),
    調整_Bridge: createAdjustmentGroup(b_ids),
    調整_Chorus2: createAdjustmentGroup(c2_ids),
    調整_Outro: createAdjustmentGroup(o_ids),
    題名設定: z.object({
        表示テキスト: z.string().default('夢喰いバク'),
        開始フレーム: z.number().default(112),
        終了フレーム: z.number().default(330),
        文字サイズpx: z.number().default(80),
        文字色: zColor().default('#ffffff'),
        文字間隔: z.string().default('4em'),
        演出モード: z.enum(['box-expand', 'wipe-up', 'wipe-right', 'slice-diagonal', 'shutter']).default('box-expand'),
        退場時間フレーム: z.number().optional().default(90).describe('終了の何フレーム前から退場を開始するか'),
    }).default({}),
    監査モード: z.boolean().default(false),
    // Added for ShortsMaker to force full duration. Optional, so FullMV3 is unaffected.
    overrideDurationInFrames: z.number().optional().describe('尺の強制上書き(Shorts用)'),
});

interface SubtitleItem {
    id: number;
    start: number;
    end: number;
    text: string;
    section: string; // 'verse1', 'chorus1', 'bridge', etc.
    mode: string;
}

export const StandardSubtitleCompositionV7: React.FC<z.infer<typeof standardSubtitleV7Schema>> = ({
    全体設定,
    Aメロ設定,
    Bメロ設定,
    サビ設定,
    Cメロ設定,
    Outro設定,
    調整_Verse1,
    調整_Chorus1,
    調整_Verse2,
    調整_Bridge,
    調整_Chorus2,
    調整_Outro,
    題名設定,
    監査モード,
    overrideDurationInFrames,
}) => {
    const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
    const { fps } = useVideoConfig(); // durationInFrames removed as unused

    useEffect(() => {
        const loadSubtitles = async () => {
            try {
                const jsonUrl = staticFile('final_subtitles.json');
                const res = await Promise.race([
                    fetch(`${jsonUrl}?t=${Date.now()}`),
                    new Promise<Response>((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout loading subtitles')), 2000)
                    ),
                ]);

                if (!res.ok) throw new Error('Failed to load subtitles');
                const data = await res.json();
                setSubtitles(data);
            } catch (err) {
                console.error('Failed to load Whisper subtitles:', err);
            }
        };
        loadSubtitles();
    }, []);

    if (監査モード) {
        return <LyricsAuditComposition />;
    }

    // Helper to get style based on section
    const getStyle = (section: string) => {
        // Fallback to Aメロ設定 if specific style is undefined
        // Ideally schema defaults prevent this, but this protects against runtime undefined
        if (section.includes('pre-chorus') || section.includes('preChorus')) return Bメロ設定 || Aメロ設定;
        if (section.startsWith('chorus')) return サビ設定 || Aメロ設定;
        if (section.startsWith('bridge')) return Cメロ設定 || Aメロ設定;
        if (section.startsWith('outro')) return Outro設定 || Aメロ設定;
        return Aメロ設定; // Default to verse
    };

    // Render all subtitles in Sequence
    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* Full MV Background Video */}
            <Video src={staticFile('フル夢食いバク.mp4')} />
            {subtitles.map((currentSubtitle, index) => {
                const style = getStyle(currentSubtitle.section);

                // --- Apply Adjustments ---
                let adj = { startFrame: 0, endFrame: 0, charDuration: 0, scale: 1, fadeOut: 0, position: undefined as string | undefined, highlight: false };
                const sec = currentSubtitle.section;

                // Note: idKey now contains the lyric text "id_0_Text....."
                // We need to find the key in the object that STARTS with "id_{id}_"
                const targetPrefix = `id_${currentSubtitle.id}_`;

                let tempAdjGroup: any = {};
                if (sec === 'verse1') tempAdjGroup = 調整_Verse1 || {};
                else if (sec === 'chorus1') tempAdjGroup = 調整_Chorus1 || {};
                else if (sec === 'verse2') tempAdjGroup = 調整_Verse2 || {};
                else if (sec === 'bridge') tempAdjGroup = 調整_Bridge || {};
                else if (sec === 'chorus2') tempAdjGroup = 調整_Chorus2 || {};
                else if (sec.startsWith('outro')) tempAdjGroup = 調整_Outro || {};

                const foundKey = Object.keys(tempAdjGroup).find(k => k.startsWith(targetPrefix));
                if (foundKey) {
                    adj = tempAdjGroup[foundKey];
                }

                const adjustedStartFrame = (currentSubtitle.start * fps) + adj.startFrame;
                const adjustedEndFrame = (currentSubtitle.end * fps) + adj.endFrame;
                let durationInFrames = adjustedEndFrame - adjustedStartFrame;
                if (durationInFrames < 1) durationInFrames = 30; // Safety

                const safeScale = Math.max(0, adj.scale);
                const finalFontSize = style.文字サイズpx * safeScale;

                // Use per-ID charDuration if set (>0), otherwise global default
                const rawCharDuration = (adj.charDuration && adj.charDuration > 0)
                    ? adj.charDuration
                    : 全体設定.charDuration;
                const finalCharDuration = Math.max(1, rawCharDuration);

                // Determine animation mode
                let mode: any = currentSubtitle.mode;
                if (mode === 'kinetic' || mode === 'random') {
                    const modes = ['wipe-right', 'wipe-up', 'slice-diagonal', 'box-expand'] as const;
                    mode = modes[index % modes.length];
                } else if (mode === 'simple-fade') {
                    mode = 'fade';
                }

                // Strict Verse 1 Check
                const isVerse1 = currentSubtitle.section === 'verse1';
                const isOutro = currentSubtitle.section === 'outro';

                // Calculate Extended Duration for Verse 1 Cycle
                let sequenceDuration = durationInFrames;

                // Only extend if NO manual fadeOut is set (Default Cycle Mode)
                // If fadeOut is set, respect natural duration so user can fade out easily
                if (isVerse1 && adj.fadeOut === 0) {
                    const verse1Subtitles = subtitles.filter(s => s.section === 'verse1');
                    const relativeIndex = verse1Subtitles.findIndex(s => s.id === currentSubtitle.id);

                    const nextSub = verse1Subtitles[relativeIndex + 1];
                    const nextNextSub = verse1Subtitles[relativeIndex + 2];

                    if (nextSub) sequenceDuration += (nextSub.end - nextSub.start) * fps;
                    if (nextNextSub) sequenceDuration += (nextNextSub.end - nextNextSub.start) * fps;

                    sequenceDuration += 30; // Buffer
                }

                return (
                    <Sequence
                        key={currentSubtitle.id}
                        from={adjustedStartFrame}
                        durationInFrames={sequenceDuration}
                    >
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row-reverse', // ALWAYS row-reverse for Vertical-RL consistency

                            // --- Verse 1 Positioning (Right -> Center -> Left) ---
                            ...(isVerse1 || isOutro ? (() => {
                                // Manual Override
                                if (adj.position) {
                                    const baseStyle: React.CSSProperties = { position: 'absolute', top: '50%', width: 'auto', justifyContent: 'center' };
                                    switch (adj.position) {
                                        case 'right': return { ...baseStyle, right: '15%', transform: 'translateY(-50%)' };
                                        case 'center-right': return { ...baseStyle, right: '32.5%', transform: 'translateY(-50%)' };
                                        case 'center-right-top': return { ...baseStyle, right: '32.5%', top: '35%', transform: 'translateY(-50%)' };
                                        case 'center-right-bottom': return { ...baseStyle, right: '32.5%', top: '65%', transform: 'translateY(-50%)' };
                                        case 'center': return { ...baseStyle, left: '50%', transform: 'translate(-50%, -50%)' };
                                        case 'center-left': return { ...baseStyle, left: '32.5%', transform: 'translateY(-50%)' };
                                        case 'center-left-top': return { ...baseStyle, left: '32.5%', top: '35%', transform: 'translateY(-50%)' };
                                        case 'center-left-bottom': return { ...baseStyle, left: '32.5%', top: '65%', transform: 'translateY(-50%)' };
                                        case 'left': return { ...baseStyle, left: '15%', transform: 'translateY(-50%)' };

                                    }
                                }

                                const verse1Subtitles = subtitles.filter(s => s.section === 'verse1');
                                const relativeIndex = verse1Subtitles.findIndex(s => s.id === currentSubtitle.id);
                                const safeRelIndex = relativeIndex === -1 ? 0 : relativeIndex;
                                const posIndex = safeRelIndex % 3;

                                if (posIndex === 0) {
                                    // 0: Right (15% - Widen gap)
                                    return {
                                        position: 'absolute',
                                        right: '15%',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: 'auto',
                                        justifyContent: 'center',
                                    };
                                } else if (posIndex === 1) {
                                    // 1: Center (50%)
                                    return {
                                        position: 'absolute',
                                        left: '50%',
                                        top: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: 'auto',
                                        justifyContent: 'center',
                                    };
                                } else {
                                    // 2: Left (15% - Widen gap)
                                    return {
                                        position: 'absolute',
                                        left: '15%',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: 'auto',
                                        justifyContent: 'center',
                                    };
                                }
                            })() as React.CSSProperties : {})
                        }}>
                            <SharpRevealText
                                text={currentSubtitle.text}
                                mode={mode}
                                durationInFrames={sequenceDuration} // Pass actual duration for fade calculation
                                fadeOutDuration={adj.fadeOut} // Pass fadeOut adjustment
                                charDuration={finalCharDuration}

                                // Apply Section Style
                                fontSize={finalFontSize}
                                color={style.文字色}
                                letterSpacing={style.文字間隔}
                                lineGap={style.行間隔px}
                                kanjiScale={style.漢字拡大率}
                                kanaScale={style.かな拡大率}

                                // Apply Global Settings
                                jitter={全体設定.jitter}
                                accentColor={全体設定.accentColor}
                                strokeWidth={全体設定.strokeWidth}
                                strokeColor={全体設定.strokeColor}
                                shadowBlur={全体設定.shadowBlur}
                                shadowColor={全体設定.shadowColor}

                                // Visibility Helper
                                edgeOutline={adj.highlight}

                                lineThickness={全体設定.lineThickness}
                                boxThickness={全体設定.boxThickness}
                                hexagonThickness={全体設定.hexagonThickness}

                                specialEndingAnimation={false}

                                // Cycle Mode Props (Calculated in render loop)
                                {...(() => {
                                    if (!isVerse1) return {};

                                    const origDuration = (currentSubtitle.end - currentSubtitle.start) * fps;
                                    const verse1Subtitles = subtitles.filter(s => s.section === 'verse1');
                                    const relativeIndex = verse1Subtitles.findIndex(s => s.id === currentSubtitle.id);

                                    const nextSub = verse1Subtitles[relativeIndex + 1];
                                    const nextNextSub = verse1Subtitles[relativeIndex + 2];

                                    const d1 = origDuration;
                                    const d2 = nextSub ? (nextSub.end - nextSub.start) * fps : 0;
                                    const d3 = nextNextSub ? (nextNextSub.end - nextNextSub.start) * fps : 0;

                                    return {
                                        // Only enable cycle if no manual fadeOut (user wants standard behavior)
                                        cycleMode: adj.fadeOut === 0,
                                        d1, d2, d3
                                    };
                                })()}
                            />
                        </div>
                    </Sequence>
                );
            })}

            {/* Title Display */}
            <Sequence from={題名設定.開始フレーム} durationInFrames={題名設定.終了フレーム - 題名設定.開始フレーム}>
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                }}>
                    <TitleRevealText
                        text={題名設定.表示テキスト}
                        mode={題名設定.演出モード}
                        durationInFrames={題名設定.終了フレーム - 題名設定.開始フレーム}
                        fadeOutDuration={題名設定.退場時間フレーム}
                        charDuration={全体設定.charDuration}
                        fontSize={題名設定.文字サイズpx}
                        color={題名設定.文字色}
                        letterSpacing={題名設定.文字間隔}
                        lineGap={200}
                        kanjiScale={1}
                        kanaScale={1}
                        accentColor={全体設定.accentColor}
                        strokeWidth={全体設定.strokeWidth}
                        strokeColor={全体設定.strokeColor}
                        shadowBlur={全体設定.shadowBlur}
                        shadowColor={全体設定.shadowColor}
                        lineThickness={全体設定.lineThickness}
                        boxThickness={全体設定.boxThickness}
                        hexagonThickness={全体設定.hexagonThickness}
                        specialEndingAnimation={false}
                    />
                </div>
            </Sequence>

        </AbsoluteFill>
    );
};

// FullMV3 Default Props
export const defaultFullMV3Props = {
    全体設定: {
        fontFamily: '"Zen Old Mincho", "Hiragino Mincho ProN", serif',
        baseFontSize: 60,
        fontWeight: 700,
        letterSpacing: '0.15em',
        strokeWidth: 4,
        strokeColor: 'rgba(0,0,0,0.8)',
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowBlur: 10,
        lineThickness: 3,
        boxThickness: 3,
        hexagonThickness: 3,
        accentColor: '#ff0000',
        charDuration: 15,
        jitter: 0,
    },
    Aメロ設定: {
        文字サイズpx: 70,
        文字色: '#ffffff',
        文字間隔: '0.15em',
        行間隔px: 120,
        漢字拡大率: 1.1,
        かな拡大率: 0.9
    },
    Bメロ設定: {
        文字サイズpx: 70,
        文字色: '#ffffff',
        文字間隔: '0.1em',
        行間隔px: 120,
        漢字拡大率: 1.1,
        かな拡大率: 0.9
    },
    サビ設定: {
        文字サイズpx: 105,
        文字色: '#ffffff',
        文字間隔: '0em',
        行間隔px: 180,
        漢字拡大率: 1.2,
        かな拡大率: 0.9
    },
    Cメロ設定: {
        文字サイズpx: 70,
        文字色: '#ffffff',
        文字間隔: '0.1em',
        行間隔px: 120,
        漢字拡大率: 1.1,
        かな拡大率: 0.9
    },
    Outro設定: {
        文字サイズpx: 60,
        文字色: '#ffffff',
        文字間隔: '0.2em',
        行間隔px: 100,
        漢字拡大率: 1,
        かな拡大率: 1
    },
    題名設定: {
        表示テキスト: '夢喰いバク',
        開始フレーム: 112,
        終了フレーム: 330,
        文字サイズpx: 80,
        文字色: '#ffffff',
        文字間隔: '4em',
        演出モード: 'box-expand' as const,
        退場時間フレーム: 90
    },
    調整_Verse1: defaultAdjustments_Verse1,
    調整_Chorus1: defaultAdjustments_Chorus1,
    調整_Verse2: defaultAdjustments_Verse2,
    調整_Bridge: defaultAdjustments_Bridge,
    調整_Chorus2: defaultAdjustments_Chorus2,
    調整_Outro: defaultAdjustments_Outro,
    監査モード: false
};
