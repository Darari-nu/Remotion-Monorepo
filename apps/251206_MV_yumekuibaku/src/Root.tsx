import { Composition } from "remotion";
import {
  StandardShortsComposition,
  standardShortsSchema,
} from "./StandardShortsComposition";
import { MainVideo, mainCompositionSchema } from "./Composition";
import { Subtitle, subtitleSchema } from "./Subtitle";
import {
  KineticLyricEngine,
  kineticLyricEngineSchema,
} from "./KineticLyricEngine";
import { KineticText, kineticTextSchema } from "./KineticText"; // Import Template
import {
  ChorusComposition,
  chorusCompositionSchema,
} from "./ChorusComposition";
import { StandardSubtitleComposition } from "./StandardSubtitleComposition";
import {
  StandardSubtitleCompositionV2,
  standardSubtitleV2Schema,
} from "./StandardSubtitleCompositionV2";
import {
  StandardSubtitleCompositionV3,
  standardSubtitleV3Schema,
} from "./StandardSubtitleCompositionV3";
import {
  StandardSubtitleCompositionV4,
  standardSubtitleV4Schema,
} from "./StandardSubtitleCompositionV4";
import {
  StandardSubtitleCompositionV5,
  standardSubtitleV5Schema,
} from "./StandardSubtitleCompositionV5";
import {
  StandardSubtitleCompositionV6,
  standardSubtitleV6Schema,
} from "./StandardSubtitleCompositionV6";
import {
  StandardSubtitleCompositionV7,
  standardSubtitleV7Schema,
} from "./StandardSubtitleCompositionV7";

// Define the duration based on the song length (approx 3:45 -> 225s * 30fps = 6750)
const DURATION_IN_FRAMES = 6750;
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={MainVideo}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        schema={mainCompositionSchema}
        defaultProps={{
          subtitleStyle: {
            fontSize: 60,
            color: "#ffffff",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: 20,
            borderRadius: 10,
            bottomOffset: 120,
            fontFamily: "sans-serif",
          },
        }}
      />
      <Composition
        id="SubtitleTemplate"
        component={Subtitle}
        durationInFrames={150} // 5 seconds
        fps={FPS}
        width={1920}
        height={1080}
        schema={subtitleSchema}
        defaultProps={{
          text: "これは字幕のサンプルです。\nここを編集してスタイルを確認できます。",
          style: {
            fontSize: 60,
            color: "#ffffff",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: 20,
            borderRadius: 10,
            bottomOffset: 120,
            fontFamily: "sans-serif",
          },
        }}
      />
      <Composition
        id="KineticLyric"
        component={KineticLyricEngine}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        schema={kineticLyricEngineSchema}
        defaultProps={{
          text: "昔々あるところに\nおじいさんとおばあさんが\n住んでいました\n川へ洗濯に行くと\n大きな桃が\nドンブラコ\nドンブラコと\n流れてきました",
          spread: 200,
          stagger: 5,
          kanjiScale: 1.1,
          kanaScale: 0.9,
          jitter: 10,
        }}
      />
      <Composition
        id="ChorusSabi"
        component={ChorusComposition}
        durationInFrames={Math.round(29.29 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        schema={chorusCompositionSchema}
        defaultProps={{
          baseFontSize: 160,
          kanjiScale: 1.2,
          hiraganaScale: 1.0,
        }}
      />
      <Composition
        id="StandardSubtitles"
        component={StandardSubtitleComposition}
        durationInFrames={Math.round(29.29 * FPS)} // Match video duration (29.29s)
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="StandardSubtitlesV2"
        component={StandardSubtitleCompositionV2}
        durationInFrames={Math.round(29.29 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        schema={standardSubtitleV2Schema}
        defaultProps={{
          fontSize: 80,
          color: "#ffffff",
          letterSpacing: "0.1em",
          animationSpeed: 15,
        }}
      />
      <Composition
        id="StandardSubtitlesV3"
        component={StandardSubtitleCompositionV3}
        durationInFrames={Math.round(29.29 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        schema={standardSubtitleV3Schema}
        defaultProps={{
          fontSize: 50, // User requested 50
          color: "#ffffff",
          letterSpacing: "0.25em", // Increased spacing for large characters
          animationSpeed: 15,
          spread: 200,
          stagger: 5,
          kanjiScale: 4, // User requested 4
          kanaScale: 2, // User requested 2
          jitter: 38,
          stiffness: 23,
          damping: 105,
          lineGap: 100,
        }}
      />
      <Composition
        id="StandardSubtitlesV4"
        component={StandardSubtitleCompositionV4}
        durationInFrames={Math.round(29.29 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        schema={standardSubtitleV4Schema}
        defaultProps={{
          fontSize: 50,
          color: "#ffffff",
          letterSpacing: "0.25em",
          animationSpeed: 15,
          spread: 200,
          stagger: 5,
          kanjiScale: 4,
          kanaScale: 2,
          jitter: 38,
          stiffness: 23,
          damping: 105,
          lineGap: 100,
          // Visibility defaults
          shadowBlur: 15,
          shadowColor: "rgba(0,0,0,0.9)", // Strong shadow
          strokeWidth: 0,
          strokeColor: "rgba(0,0,0,0.5)",
        }}
      />
      <Composition
        id="StandardSubtitlesV5"
        component={StandardSubtitleCompositionV5}
        durationInFrames={Math.round(29.29 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        schema={standardSubtitleV5Schema}
        defaultProps={{
          fontSize: 50,
          color: "#ffffff",
          letterSpacing: "0.25em",
          animationSpeed: 15,
          spread: 200,
          stagger: 5,
          kanjiScale: 4,
          kanaScale: 2,
          jitter: 38,
          stiffness: 23,
          damping: 105,
          lineGap: 100,
          shadowBlur: 15,
          shadowColor: "rgba(0,0,0,0.9)",
          strokeWidth: 0,
          strokeColor: "rgba(0,0,0,0.5)",
        }}
      />
      <Composition
        id="StandardSubtitlesV6"
        component={StandardSubtitleCompositionV6}
        durationInFrames={Math.round(29.29 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        schema={standardSubtitleV6Schema}
        defaultProps={{
          fontSize: 50,
          color: "#ffffff",
          letterSpacing: "2em",
          stagger: 5,
          kanjiScale: 4,
          kanaScale: 2,
          jitter: 38,
          lineGap: 200,
          shadowBlur: 15,
          shadowColor: "rgba(0,0,0,0.9)",
          strokeWidth: 0,
          strokeColor: "rgba(0,0,0,0.5)",
          accentColor: "#808080",
          lineThickness: 5,
          boxThickness: 5,
          hexagonThickness: 5,
          charDuration: 25,
        }}
      />
      <Composition
        id="KineticTextTemplate"
        component={KineticText}
        durationInFrames={150} // 5s default
        fps={FPS}
        width={1920}
        height={1080}
        schema={kineticTextSchema}
        defaultProps={{
          text: "KINETIC\nTYPOGRAPHY",
          mode: "random",
          fontSize: 120,
          fontFamily: '"Zen Old Mincho", "Hiragino Mincho ProN", serif',
          accentColor: "#808080", // Gray default
          color: "#ffffff",
          lineThickness: 5,
          boxThickness: 5,
          hexagonThickness: 5,
          fontWeight: "bold",
          letterSpacing: "0.2em",
          lineGap: 20,
          charDuration: 15,
          stagger: 3,
          jitter: 15,
          jitterRotation: 5,
          shadowBlur: 10,
          shadowColor: "rgba(0,0,0,0.8)",
        }}
      />
      <Composition
        id="FullMV"
        component={StandardSubtitleCompositionV7}
        durationInFrames={7187} // 239.57s * 30fps
        fps={FPS}
        width={1920}
        height={1080}
        schema={standardSubtitleV7Schema}
        defaultProps={{
          全体設定: {
            charDuration: 25,
            jitter: 38,
            shadowBlur: 15,
            shadowColor: "rgba(0,0,0,0.9)",
            strokeWidth: 0,
            strokeColor: "rgba(0,0,0,0.5)",
            accentColor: "#808080",
            lineThickness: 5,
            boxThickness: 5,
            hexagonThickness: 5,
          },
          Aメロ設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          Bメロ設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          サビ設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          Cメロ設定: {
            文字サイズpx: 50,
            文字色: "#ccccff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          Outro設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          調整_Verse1: {
            id_0_午前2時: {
              startFrame: 0,
              endFrame: 104,
              charDuration: 39,
              scale: 1,
              fadeOut: 50,
            },
            id_1_突然の悪夢: {
              startFrame: 0,
              endFrame: 102,
              charDuration: 46,
              scale: 1,
              fadeOut: 50,
            },
            id_2_窓の外は: {
              startFrame: 0,
              endFrame: 103,
              charDuration: 43,
              scale: 1,
              fadeOut: 50,
            },
            id_3_静かな雨音: {
              startFrame: 0,
              endFrame: 100,
              charDuration: 57,
              scale: 1,
              fadeOut: 50,
            },
            id_4_あの子の好きな: {
              startFrame: -7,
              endFrame: 90,
              charDuration: 64,
              scale: 1,
              fadeOut: 50,
            },
            id_5_優しい音: {
              startFrame: -41,
              endFrame: 125,
              charDuration: 104,
              scale: 1,
              fadeOut: 50,
            },
            id_6_耳をすませば_さっきの恐怖は: {
              startFrame: -9,
              endFrame: 51,
              charDuration: 61,
              scale: 1,
              fadeOut: 50,
            },
            id_7_まるで: {
              startFrame: 0,
              endFrame: 87,
              charDuration: 0,
              scale: 1,
              fadeOut: 50,
            },
            id_8_バクが_食べちゃったみたい: {
              startFrame: 0,
              endFrame: 53,
              charDuration: 40,
              scale: 1,
              fadeOut: 50,
            },
            id_9_昨日見た: {
              startFrame: 0,
              endFrame: 100,
              charDuration: 0,
              scale: 1,
              fadeOut: 50,
            },
            id_10_寂しそうな横顔: {
              startFrame: -25,
              endFrame: 66,
              charDuration: 92,
              scale: 1,
              fadeOut: 50,
            },
            id_1001_あれは: {
              startFrame: -8,
              endFrame: 66,
              charDuration: 0,
              scale: 1,
              fadeOut: 50,
            },
            id_1002_ボクの: {
              startFrame: -35,
              endFrame: 78,
              charDuration: 81,
              scale: 1,
              fadeOut: 50,
            },
            "id_1003_気のせい？": {
              startFrame: -36,
              endFrame: 90,
              charDuration: 77,
              scale: 1,
              fadeOut: 50,
            },
            id_1004_あの子には: {
              startFrame: -13,
              endFrame: 91,
              charDuration: 61,
              scale: 1,
              fadeOut: 50,
            },
            id_1005_叩きつける嵐: {
              startFrame: -50,
              endFrame: 73,
              charDuration: 80,
              scale: 1,
              fadeOut: 50,
            },
            id_1006_じゃなく: {
              startFrame: -54,
              endFrame: 137,
              charDuration: 81,
              scale: 1,
              fadeOut: 50,
            },
            id_13_やさしい: {
              startFrame: -126,
              endFrame: 142,
              charDuration: 271,
              scale: 1,
              fadeOut: 50,
            },
            id_14_雨音だけ: {
              startFrame: -106,
              endFrame: 124,
              charDuration: 252,
              scale: 1,
              fadeOut: 50,
            },
            id_1007_届けば: {
              startFrame: -96,
              endFrame: 88,
              charDuration: 249,
              scale: 1,
              fadeOut: 50,
            },
            id_1008_いいのに: {
              startFrame: -44,
              endFrame: 55,
              charDuration: 150,
              scale: 1,
              fadeOut: 50,
            },
          },
          調整_Chorus1: {
            id_16_ねぇ: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_17_夢喰いバク_もしもいるのなら: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_18_どうか今夜_あの子の_夢を守っ: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_19_ささくれみたいな_後悔_喉を締: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_20_全部_悪い夢にして_食べ尽くし: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
          },
          調整_Verse2: {
            id_21_にぎやかな_昼休み: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_22_すれ違いざま: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_23_あの子から_感じた_涙の気配: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_24_振り返って_追いかけたいのに: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_25_これは_昨日見た_悪夢の続きだ: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_26_喉から_手が出るほど_願うのに: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_27_地面に_縫い付けられた_ように: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_28_僕の_足は_動かない: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
          },
          調整_Bridge: {
            id_29_今夜: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_30_僕は_バクの背中に_またがって: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_31_ざらつく_後悔の砂嵐を_越える: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_32_音を: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_33_なくした_あの子の心に: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_34_産声_みたいな夢を_届けにいこ: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
          },
          調整_Chorus2: {
            id_35_ねぇ: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            "id_36_夢喰いバク_聞こえてる？": {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_37_あの子の_泣き声が_夜に溶けて: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_38_ボクの声じゃ_届かないから: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_39_君があの子を_包んであげて: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
          },
          調整_Outro: {
            id_40_朽ちユクだけノ: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_41_ちいサナはなモ: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_42_イノるコトバさえ: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_43_ナくしたくちびルも: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_44_スベて悪夢にシテ: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_45_クイ尽くスから: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_46_どうかアノコの: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_47_朝が: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_48_ハレ渡り: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
            id_49_まスヨウに: {
              startFrame: 0,
              endFrame: 0,
              charDuration: 0,
              scale: 1,
              fadeOut: 0,
            },
          },
          題名設定: {
            表示テキスト: "夢喰いバク",
            開始フレーム: 112,
            終了フレーム: 330,
            文字サイズpx: 80,
            文字色: "#ffffff",
            文字間隔: "4em",
            演出モード: "box-expand",
            退場時間フレーム: 90,
          },
          監査モード: false,
        }}
      />
      <Composition
        id="FullMV2"
        component={StandardSubtitleCompositionV7}
        durationInFrames={7187}
        fps={FPS}
        width={1920}
        height={1080}
        schema={standardSubtitleV7Schema}
        defaultProps={{
          全体設定: {
            charDuration: 25,
            jitter: 38,
            shadowBlur: 15,
            shadowColor: "rgba(0,0,0,0.9)",
            strokeWidth: 0,
            strokeColor: "rgba(0,0,0,0.5)",
            accentColor: "#808080",
            lineThickness: 5,
            boxThickness: 5,
            hexagonThickness: 5,
          },
          Aメロ設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          Bメロ設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          サビ設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          Cメロ設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          Outro設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          調整_Verse1: {
            id_0_午前2時: {
              startFrame: 0,
              endFrame: 104,
              charDuration: 39,
              scale: 1,
              fadeOut: 50,
            },
            id_1_突然の悪夢: {
              startFrame: 0,
              endFrame: 102,
              charDuration: 46,
              scale: 1,
              fadeOut: 50,
            },
            id_2_窓の外は: {
              startFrame: 0,
              endFrame: 103,
              charDuration: 43,
              scale: 1,
              fadeOut: 50,
            },
            id_3_静かな雨音: {
              startFrame: 0,
              endFrame: 100,
              charDuration: 57,
              scale: 1,
              fadeOut: 50,
            },
            id_4_あの子の好きな: {
              startFrame: -7,
              endFrame: 90,
              charDuration: 64,
              scale: 1,
              fadeOut: 50,
            },
            id_5_優しい音: {
              startFrame: -41,
              endFrame: 125,
              charDuration: 104,
              scale: 1,
              fadeOut: 50,
            },
            id_6_耳をすませば_さっきの恐怖は: {
              startFrame: -9,
              endFrame: 51,
              charDuration: 61,
              scale: 1,
              fadeOut: 50,
            },
            id_7_まるで: {
              startFrame: 0,
              endFrame: 132,
              charDuration: 0,
              scale: 1,
              fadeOut: 50,
              position: "right",
            },
            id_8_バクが: {
              startFrame: 0,
              endFrame: 91,
              charDuration: 40,
              scale: 1,
              fadeOut: 50,
              position: "center",
            },
            id_1009_食べちゃったみたい: {
              startFrame: 0,
              endFrame: 52,
              charDuration: 40,
              scale: 1,
              fadeOut: 50,
              position: "left",
            },
            id_9_昨日見た: {
              startFrame: 0,
              endFrame: 100,
              charDuration: 0,
              scale: 1,
              fadeOut: 50,
              position: "center-right",
            },
            id_10_寂しそうな横顔: {
              startFrame: -25,
              endFrame: 66,
              charDuration: 92,
              scale: 1,
              fadeOut: 50,
              position: "center-left",
            },
            id_1001_あれは: {
              startFrame: -8,
              endFrame: 66,
              charDuration: 0,
              scale: 1,
              fadeOut: 50,
            },
            id_1002_ボクの: {
              startFrame: -35,
              endFrame: 78,
              charDuration: 81,
              scale: 1,
              fadeOut: 50,
            },
            "id_1003_気のせい？": {
              startFrame: -36,
              endFrame: 90,
              charDuration: 77,
              scale: 1,
              fadeOut: 50,
            },
            id_1004_あの子には: {
              startFrame: -13,
              endFrame: 91,
              charDuration: 61,
              scale: 1,
              fadeOut: 50,
              position: "right",
            },
            id_1005_叩きつける嵐: {
              startFrame: -50,
              endFrame: 73,
              charDuration: 80,
              scale: 1,
              fadeOut: 50,
              position: "center",
            },
            id_1006_じゃなく: {
              startFrame: -54,
              endFrame: 137,
              charDuration: 81,
              scale: 1,
              fadeOut: 50,
              position: "left",
            },
            id_13_やさしい: {
              startFrame: -126,
              endFrame: 142,
              charDuration: 271,
              scale: 1,
              fadeOut: 50,
              position: "right",
            },
            id_14_雨音だけ: {
              startFrame: -106,
              endFrame: 124,
              charDuration: 252,
              scale: 1,
              fadeOut: 50,
              position: "center-right",
            },
            id_1007_届けば: {
              startFrame: -96,
              endFrame: 88,
              charDuration: 249,
              scale: 1,
              fadeOut: 50,
              position: "center-left",
            },
            id_1008_いいのに: {
              startFrame: -44,
              endFrame: 37,
              charDuration: 150,
              scale: 1,
              fadeOut: 10,
              position: "left",
            },
          },
          調整_Chorus1: {
            id_16_ねぇ: {
              startFrame: 0,
              endFrame: 18,
              charDuration: 0,
              scale: 2,
              fadeOut: 9,
            },
            id_17_夢喰いバク_もしもいるのなら: {
              startFrame: -6,
              endFrame: 11,
              charDuration: 21,
              scale: 1,
              fadeOut: 9,
            },
            id_18_どうか今夜_あの子の_夢を守っ: {
              startFrame: -10,
              endFrame: 10,
              charDuration: 20,
              scale: 1,
              fadeOut: 10,
            },
            id_19_ささくれみたいな_後悔_喉を締: {
              startFrame: -8,
              endFrame: 10,
              charDuration: 20,
              scale: 1,
              fadeOut: 10,
            },
            id_20_全部_悪い夢にして_食べ尽くし: {
              startFrame: -16,
              endFrame: 111,
              charDuration: 40,
              scale: 1,
              fadeOut: 22,
            },
          },
          調整_Verse2: {
            id_21_にぎやかな_昼休み: {
              startFrame: -18,
              endFrame: 0,
              charDuration: 30,
              scale: 1,
              fadeOut: 0,
            },
            id_22_すれ違いざま: {
              startFrame: -9,
              endFrame: 0,
              charDuration: 30,
              scale: 1,
              fadeOut: 0,
            },
            id_23_あの子から_感じた_涙の気配: {
              startFrame: -27,
              endFrame: 0,
              charDuration: 70,
              scale: 1,
              fadeOut: 0,
            },
            id_24_振り返って_追いかけたいのに: {
              startFrame: -29,
              endFrame: 11,
              charDuration: 79,
              scale: 1,
              fadeOut: 5,
            },
            id_25_これは_昨日見た_悪夢の続きだ: {
              startFrame: -27,
              endFrame: 19,
              charDuration: 59,
              scale: 1,
              fadeOut: 7,
            },
            id_26_喉から_手が出るほど_願うのに: {
              startFrame: 0,
              endFrame: 32,
              charDuration: 0,
              scale: 1,
              fadeOut: 5,
            },
            id_27_地面に_縫い付けられた_ように: {
              startFrame: 0,
              endFrame: 16,
              charDuration: 0,
              scale: 1,
              fadeOut: 8,
            },
            id_28_僕の_足は_動かない: {
              startFrame: -34,
              endFrame: 87,
              charDuration: 100,
              scale: 1,
              fadeOut: 6,
            },
          },
          調整_Bridge: {
            id_29_今夜: {
              startFrame: -17,
              endFrame: 0,
              charDuration: 40,
              scale: 1,
              fadeOut: 24,
            },
            id_30_僕は_バクの背中に_またがって: {
              startFrame: -4,
              endFrame: 17,
              charDuration: 30,
              scale: 1,
              fadeOut: 2,
            },
            id_31_ざらつく_後悔の砂嵐を_越える: {
              startFrame: -29,
              endFrame: 14,
              charDuration: 49,
              scale: 1,
              fadeOut: 23,
            },
            id_32_音を: {
              startFrame: -31,
              endFrame: 9,
              charDuration: 80,
              scale: 1,
              fadeOut: 1,
            },
            id_33_なくした_あの子の心に: {
              startFrame: -7,
              endFrame: 16,
              charDuration: 31,
              scale: 1,
              fadeOut: 7,
            },
            id_34_産声_みたいな夢を_届けにいこ: {
              startFrame: -5,
              endFrame: 51,
              charDuration: 30,
              scale: 1,
              fadeOut: 20,
            },
          },
          調整_Chorus2: {
            id_35_ねぇ: {
              startFrame: 0,
              endFrame: 19,
              charDuration: 0,
              scale: 2,
              fadeOut: 11,
            },
            "id_36_夢喰いバク_聞こえてる？": {
              startFrame: -16,
              endFrame: 6,
              charDuration: 50,
              scale: 1,
              fadeOut: 2,
            },
            id_37_あの子の_泣き声が_夜に溶けて: {
              startFrame: -44,
              endFrame: 17,
              charDuration: 69,
              scale: 1,
              fadeOut: 4,
            },
            id_38_ボクの声じゃ_届かないから: {
              startFrame: -6,
              endFrame: 18,
              charDuration: 51,
              scale: 1,
              fadeOut: 5,
            },
            id_39_君があの子を_包んであげて: {
              startFrame: -28,
              endFrame: 129,
              charDuration: 80,
              scale: 1,
              fadeOut: 50,
            },
          },
          調整_Outro: {
            id_40_朽ちユクだけノ: {
              startFrame: -14,
              endFrame: 226,
              charDuration: 0,
              scale: 1,
              fadeOut: 75,
              position: "right",
            },
            id_41_ちいサナはなモ: {
              startFrame: -13,
              endFrame: 157,
              charDuration: 0,
              scale: 1,
              fadeOut: 94,
              position: "center-right",
            },
            id_42_イノるコトバさえ: {
              startFrame: -4,
              endFrame: 122,
              charDuration: 0,
              scale: 1,
              fadeOut: 81,
              position: "center-left",
            },
            id_43_ナくしたくちびルも: {
              startFrame: 0,
              endFrame: 35,
              charDuration: 0,
              scale: 1,
              fadeOut: 58,
              position: "left",
            },
            id_44_スベて悪夢にシテ: {
              startFrame: 0,
              endFrame: 220,
              charDuration: 0,
              scale: 1,
              fadeOut: 53,
              position: "right",
            },
            id_45_クイ尽くスから: {
              startFrame: -5,
              endFrame: 164,
              charDuration: 0,
              scale: 1,
              fadeOut: 59,
              position: "center-right",
            },
            id_46_どうかアノコの: {
              startFrame: 0,
              endFrame: 96,
              charDuration: 0,
              scale: 1,
              fadeOut: 50,
              position: "center-left",
            },
            id_47_朝が: {
              startFrame: -8,
              endFrame: 0,
              charDuration: 50,
              scale: 1,
              fadeOut: 95,
              position: "left",
            },
            id_48_ハレ: {
              startFrame: -21,
              endFrame: 201,
              charDuration: 80,
              scale: 1,
              fadeOut: 30,
              position: "center-right-top",
            },
            id_1048_渡り: {
              startFrame: -38,
              endFrame: 190,
              charDuration: 115,
              scale: 1,
              fadeOut: 26,
              position: "center-right-bottom",
            },
            id_49_まスヨ: {
              startFrame: 0,
              endFrame: 126,
              charDuration: 0,
              scale: 1,
              fadeOut: 24,
              position: "center-left-top",
            },
            id_1049_ウに: {
              startFrame: -76,
              endFrame: 62,
              charDuration: 180,
              scale: 1,
              fadeOut: 12,
              position: "center-left-bottom",
            },
          },
          題名設定: {
            表示テキスト: "夢喰いバク",
            開始フレーム: 112,
            終了フレーム: 330,
            文字サイズpx: 80,
            文字色: "#ffffff",
            文字間隔: "4em",
            演出モード: "box-expand",
            退場時間フレーム: 90,
          },
          監査モード: false,
        }}
      />
      <Composition
        id="FullMV3"
        component={StandardSubtitleCompositionV7}
        durationInFrames={7187}
        fps={FPS}
        width={1920}
        height={1080}
        schema={standardSubtitleV7Schema}
        defaultProps={{
          全体設定: {
            charDuration: 25,
            jitter: 38,
            shadowBlur: 15,
            shadowColor: "rgba(0,0,0,0.9)",
            strokeWidth: 0,
            strokeColor: "rgba(0,0,0,0.5)",
            accentColor: "#808080",
            lineThickness: 5,
            boxThickness: 5,
            hexagonThickness: 5,
          },
          Aメロ設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          Bメロ設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          サビ設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          Cメロ設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          Outro設定: {
            文字サイズpx: 50,
            文字色: "#ffffff",
            文字間隔: "0.4em",
            行間隔px: 200,
            漢字拡大率: 4,
            かな拡大率: 2,
          },
          調整_Verse1: {
            id_0_午前2時: {
              startFrame: 0,
              endFrame: 104,
              charDuration: 39,
              scale: 1,
              fadeOut: 50,
            },
            id_1_突然の悪夢: {
              startFrame: 0,
              endFrame: 102,
              charDuration: 46,
              scale: 1,
              fadeOut: 50,
            },
            id_2_窓の外は: {
              startFrame: 0,
              endFrame: 103,
              charDuration: 43,
              scale: 1,
              fadeOut: 50,
            },
            id_3_静かな雨音: {
              startFrame: 0,
              endFrame: 100,
              charDuration: 57,
              scale: 1,
              fadeOut: 50,
            },
            id_4_あの子の好きな: {
              startFrame: -7,
              endFrame: 90,
              charDuration: 64,
              scale: 1,
              fadeOut: 50,
            },
            id_5_優しい音: {
              startFrame: -41,
              endFrame: 125,
              charDuration: 104,
              scale: 1,
              fadeOut: 50,
            },
            id_6_耳をすませば_さっきの恐怖は: {
              startFrame: -9,
              endFrame: 51,
              charDuration: 61,
              scale: 1,
              fadeOut: 50,
            },
            id_7_まるで: {
              startFrame: 0,
              endFrame: 132,
              charDuration: 0,
              scale: 1.5,
              fadeOut: 50,
              position: "right",
              highlight: true,
            },
            id_8_バクが: {
              startFrame: 0,
              endFrame: 91,
              charDuration: 40,
              scale: 1.5,
              fadeOut: 50,
              position: "center",
              highlight: true,
            },
            id_1009_食べちゃったみたい: {
              startFrame: 0,
              endFrame: 52,
              charDuration: 40,
              scale: 1,
              fadeOut: 50,
              position: "left",
              highlight: true,
            },
            id_9_昨日見た: {
              startFrame: 0,
              endFrame: 100,
              charDuration: 0,
              scale: 1,
              fadeOut: 50,
              position: "center-right",
            },
            id_10_寂しそうな横顔: {
              startFrame: -25,
              endFrame: 66,
              charDuration: 92,
              scale: 1,
              fadeOut: 50,
              position: "center-left",
            },
            id_1001_あれは: {
              startFrame: -8,
              endFrame: 66,
              charDuration: 0,
              scale: 1,
              fadeOut: 50,
            },
            id_1002_ボクの: {
              startFrame: -35,
              endFrame: 78,
              charDuration: 81,
              scale: 1,
              fadeOut: 50,
            },
            "id_1003_気のせい？": {
              startFrame: -36,
              endFrame: 90,
              charDuration: 77,
              scale: 1,
              fadeOut: 50,
            },
            id_1004_あの子には: {
              startFrame: -13,
              endFrame: 91,
              charDuration: 61,
              scale: 1,
              fadeOut: 50,
              position: "right",
            },
            id_1005_叩きつける嵐: {
              startFrame: -50,
              endFrame: 73,
              charDuration: 80,
              scale: 1,
              fadeOut: 50,
              position: "center",
            },
            id_1006_じゃなく: {
              startFrame: -54,
              endFrame: 137,
              charDuration: 81,
              scale: 1,
              fadeOut: 50,
              position: "left",
            },
            id_13_やさしい: {
              startFrame: -126,
              endFrame: 142,
              charDuration: 271,
              scale: 1,
              fadeOut: 50,
              position: "right",
            },
            id_14_雨音だけ: {
              startFrame: -106,
              endFrame: 124,
              charDuration: 252,
              scale: 1,
              fadeOut: 50,
              position: "center-right",
            },
            id_1007_届けば: {
              startFrame: -96,
              endFrame: 88,
              charDuration: 249,
              scale: 1,
              fadeOut: 50,
              position: "center-left",
            },
            id_1008_いいのに: {
              startFrame: -44,
              endFrame: 37,
              charDuration: 150,
              scale: 1,
              fadeOut: 10,
              position: "left",
            },
          },
          調整_Chorus1: {
            id_16_ねぇ: {
              startFrame: 0,
              endFrame: 18,
              charDuration: 0,
              scale: 2,
              fadeOut: 9,
            },
            id_17_夢喰いバク_もしもいるのなら: {
              startFrame: -6,
              endFrame: 11,
              charDuration: 21,
              scale: 1,
              fadeOut: 9,
            },
            id_18_どうか今夜_あの子の_夢を守っ: {
              startFrame: -10,
              endFrame: 10,
              charDuration: 20,
              scale: 1,
              fadeOut: 10,
            },
            id_19_ささくれみたいな_後悔_喉を締: {
              startFrame: -8,
              endFrame: 10,
              charDuration: 20,
              scale: 1,
              fadeOut: 10,
              highlight: true,
            },
            id_20_全部_悪い夢にして_食べ尽くし: {
              startFrame: -16,
              endFrame: 111,
              charDuration: 40,
              scale: 1,
              fadeOut: 22,
            },
          },
          調整_Verse2: {
            id_21_にぎやかな_昼休み: {
              startFrame: -18,
              endFrame: 0,
              charDuration: 30,
              scale: 1,
              fadeOut: 0,
            },
            id_22_すれ違いざま: {
              startFrame: -9,
              endFrame: 0,
              charDuration: 30,
              scale: 1,
              fadeOut: 0,
            },
            id_23_あの子から_感じた_涙の気配: {
              startFrame: -27,
              endFrame: 0,
              charDuration: 70,
              scale: 1,
              fadeOut: 0,
              highlight: true,
            },
            id_24_振り返って_追いかけたいのに: {
              startFrame: -29,
              endFrame: 11,
              charDuration: 79,
              scale: 1,
              fadeOut: 5,
              highlight: true,
            },
            id_25_これは_昨日見た_悪夢の続きだ: {
              startFrame: -27,
              endFrame: 19,
              charDuration: 59,
              scale: 1,
              fadeOut: 7,
              highlight: true,
            },
            id_26_喉から_手が出るほど_願うのに: {
              startFrame: 0,
              endFrame: 32,
              charDuration: 0,
              scale: 1,
              fadeOut: 5,
              highlight: true,
            },
            id_27_地面に_縫い付けられた_ように: {
              startFrame: 0,
              endFrame: 16,
              charDuration: 0,
              scale: 1,
              fadeOut: 8,
            },
            id_28_僕の_足は_動かない: {
              startFrame: -34,
              endFrame: 87,
              charDuration: 100,
              scale: 1,
              fadeOut: 6,
            },
          },
          調整_Bridge: {
            id_29_今夜: {
              startFrame: -17,
              endFrame: 0,
              charDuration: 40,
              scale: 1,
              fadeOut: 24,
            },
            id_30_僕は_バクの背中に_またがって: {
              startFrame: -4,
              endFrame: 17,
              charDuration: 30,
              scale: 1,
              fadeOut: 2,
              highlight: true,
            },
            id_31_ざらつく_後悔の砂嵐を_越える: {
              startFrame: -29,
              endFrame: 14,
              charDuration: 49,
              scale: 1,
              fadeOut: 23,
            },
            id_32_音を: {
              startFrame: -31,
              endFrame: 9,
              charDuration: 80,
              scale: 1,
              fadeOut: 1,
            },
            id_33_なくした_あの子の心に: {
              startFrame: -7,
              endFrame: 16,
              charDuration: 31,
              scale: 1,
              fadeOut: 7,
            },
            id_34_産声_みたいな夢を_届けにいこ: {
              startFrame: -5,
              endFrame: 51,
              charDuration: 30,
              scale: 1,
              fadeOut: 20,
              highlight: true,
            },
          },
          調整_Chorus2: {
            id_35_ねぇ: {
              startFrame: 0,
              endFrame: 19,
              charDuration: 0,
              scale: 2,
              fadeOut: 11,
            },
            "id_36_夢喰いバク_聞こえてる？": {
              startFrame: -16,
              endFrame: 6,
              charDuration: 50,
              scale: 1,
              fadeOut: 2,
            },
            id_37_あの子の_泣き声が_夜に溶けて: {
              startFrame: -44,
              endFrame: 17,
              charDuration: 69,
              scale: 1,
              fadeOut: 4,
            },
            id_38_ボクの声じゃ_届かないから: {
              startFrame: -6,
              endFrame: 18,
              charDuration: 51,
              scale: 1,
              fadeOut: 5,
            },
            id_39_君があの子を_包んであげて: {
              startFrame: -28,
              endFrame: 129,
              charDuration: 80,
              scale: 1,
              fadeOut: 50,
            },
          },
          調整_Outro: {
            id_40_朽ちユクだけノ: {
              startFrame: -14,
              endFrame: 226,
              charDuration: 0,
              scale: 1,
              fadeOut: 75,
              position: "right",
              highlight: true,
            },
            id_41_ちいサナはなモ: {
              startFrame: -13,
              endFrame: 157,
              charDuration: 0,
              scale: 1,
              fadeOut: 94,
              position: "center-right",
              highlight: true,
            },
            id_42_イノるコトバさえ: {
              startFrame: -4,
              endFrame: 122,
              charDuration: 0,
              scale: 1,
              fadeOut: 81,
              position: "center-left",
              highlight: true,
            },
            id_43_ナくしたくちびルも: {
              startFrame: 0,
              endFrame: 35,
              charDuration: 0,
              scale: 1,
              fadeOut: 58,
              position: "left",
              highlight: true,
            },
            id_44_スベて悪夢にシテ: {
              startFrame: 0,
              endFrame: 220,
              charDuration: 0,
              scale: 1,
              fadeOut: 53,
              position: "right",
              highlight: true,
            },
            id_45_クイ尽くスから: {
              startFrame: -5,
              endFrame: 164,
              charDuration: 0,
              scale: 1,
              fadeOut: 59,
              position: "center-right",
              highlight: true,
            },
            id_46_どうかアノコの: {
              startFrame: 0,
              endFrame: 96,
              charDuration: 0,
              scale: 1,
              fadeOut: 50,
              position: "center-left",
              highlight: true,
            },
            id_47_朝が: {
              startFrame: -8,
              endFrame: 0,
              charDuration: 50,
              scale: 1,
              fadeOut: 95,
              position: "left",
              highlight: true,
            },
            id_48_ハレ: {
              startFrame: -21,
              endFrame: 201,
              charDuration: 80,
              scale: 1,
              fadeOut: 30,
              position: "center-right-top",
              highlight: true,
            },
            id_1048_渡り: {
              startFrame: -38,
              endFrame: 190,
              charDuration: 115,
              scale: 1,
              fadeOut: 26,
              position: "center-right-bottom",
              highlight: true,
            },
            id_49_まスヨ: {
              startFrame: 0,
              endFrame: 126,
              charDuration: 0,
              scale: 1,
              fadeOut: 24,
              position: "center-left-top",
              highlight: true,
            },
            id_1049_ウに: {
              startFrame: -76,
              endFrame: 62,
              charDuration: 180,
              scale: 1,
              fadeOut: 12,
              position: "center-left-bottom",
              highlight: true,
            },
          },
          題名設定: {
            表示テキスト: "夢喰いバク",
            開始フレーム: 112,
            終了フレーム: 330,
            文字サイズpx: 80,
            文字色: "#ffffff",
            文字間隔: "4em",
            演出モード: "box-expand",
            退場時間フレーム: 90,
          },
          監査モード: false,
        }}
      />
      <Composition
        id="ShortsMaker"
        component={StandardShortsComposition}
        durationInFrames={9000} // Extended to 300s to match full MV
        fps={30}
        width={1080}
        height={1920}
        schema={standardShortsSchema}
        defaultProps={{
          開始時間秒: 0,
          動画の長さ秒: 60,
          上部テキスト: "夢喰いバク - MV",
          下部テキスト: "Full Versionは公式Youtubeへ",
          テキスト色: "#ffffff",
          上部背景色: "#000000",
          下部背景色: "#000000",
          上部フォントサイズ: 50,
          下部フォントサイズ: 40,
          QRコード表示: true,
          QRコードURL: "https://www.youtube.com/@coban0123",
        }}
      />
    </>
  );
};
