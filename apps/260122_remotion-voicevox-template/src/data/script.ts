import { CharacterId } from "../config";

// アニメーションの型定義
export type AnimationType = "none" | "fadeIn" | "slideUp" | "slideLeft" | "zoomIn" | "bounce";

// ビジュアルの型定義
export interface VisualContent {
  type: "image" | "text" | "none";
  src?: string;
  text?: string;
  fontSize?: number;
  color?: string;
  animation?: AnimationType;
}

// 効果音の型定義
export interface SoundEffect {
  src: string;
  volume?: number;
}

// BGM設定
export interface BGMConfig {
  src: string;
  volume?: number;
  loop?: boolean;
}

// BGM設定（動画全体で使用）
export const bgmConfig: BGMConfig | null = null;

// セリフデータの型定義
export interface ScriptLine {
  id: number;
  character: CharacterId;
  text: string;
  displayText?: string;
  scene: number;
  voiceFile: string;
  durationInFrames: number;
  pauseAfter: number;
  emotion?: "normal" | "happy" | "surprised" | "thinking" | "sad";
  visual?: VisualContent;
  se?: SoundEffect;
}

// シーン定義
export interface SceneInfo {
  id: number;
  title: string;
  background: string;
}

export const scenes: SceneInfo[] = [
  { id: 1, title: "オープニング", background: "gradient" },
  { id: 2, title: "メインコンテンツ", background: "solid" },
  { id: 3, title: "エンディング", background: "gradient" },
];

// このファイルは config/script.yaml から自動生成されます
// 編集する場合は config/script.yaml を編集して npm run sync-script を実行してください
export const scriptData: ScriptLine[] = [
  {
    "id": 1,
    "character": "zundamon",
    "text": "ＥＵエーアイアクトって知ってるのだ？",
    "displayText": "EU AI Actって知ってるのだ？",
    "scene": 1,
    "pauseAfter": 10,
    "visual": {
      "type": "text",
      "text": "EU AI Act\n(欧州AI規制法)",
      "fontSize": 80,
      "color": "#ffffff",
      "animation": "zoomIn"
    },
    "voiceFile": "01_zundamon.wav",
    "durationInFrames": 105
  },
  {
    "id": 2,
    "character": "metan",
    "text": "世界初の包括的な、エーアイ規制法のことね。",
    "displayText": "世界初の包括的なAI規制法のことね。",
    "scene": 1,
    "pauseAfter": 15,
    "voiceFile": "02_metan.wav",
    "durationInFrames": 140
  },
  {
    "id": 3,
    "character": "zundamon",
    "text": "どんな法律なのだ？",
    "scene": 2,
    "pauseAfter": 10,
    "voiceFile": "03_zundamon.wav",
    "durationInFrames": 66
  },
  {
    "id": 4,
    "character": "metan",
    "text": "リスクの高さに応じて、禁止事項や義務が決まるのよ。",
    "scene": 2,
    "pauseAfter": 20,
    "visual": {
      "type": "text",
      "text": "リスクベース\nアプローチ",
      "fontSize": 70,
      "color": "#FFd700",
      "animation": "slideUp"
    },
    "voiceFile": "04_metan.wav",
    "durationInFrames": 141
  },
  {
    "id": 5,
    "character": "zundamon",
    "text": "違反するとどうなるのだ？",
    "emotion": "surprised",
    "scene": 2,
    "pauseAfter": 10,
    "voiceFile": "05_zundamon.wav",
    "durationInFrames": 73
  },
  {
    "id": 6,
    "character": "metan",
    "text": "最大で、売上の７パーセントもの罰金があるわ。",
    "displayText": "最大で売上の7%もの罰金があるわ。",
    "scene": 2,
    "pauseAfter": 20,
    "voiceFile": "06_metan.wav",
    "durationInFrames": 143
  },
  {
    "id": 7,
    "character": "zundamon",
    "text": "それはヤバいのだ！気をつけなきゃなのだ！",
    "scene": 3,
    "pauseAfter": 10,
    "voiceFile": "07_zundamon.wav",
    "durationInFrames": 112
  },
  {
    "id": 8,
    "character": "metan",
    "text": "正しい知識で、安全に使っていきましょうね。",
    "scene": 3,
    "pauseAfter": 30,
    "voiceFile": "08_metan.wav",
    "durationInFrames": 123
  }
];

// VOICEVOXスクリプト生成用
export const generateVoicevoxScript = (
  data: ScriptLine[],
  characterSpeakerMap: Record<CharacterId, number>
) => {
  return data.map((line) => ({
    id: line.id,
    character: line.character,
    speakerId: characterSpeakerMap[line.character],
    text: line.text,
    outputFile: line.voiceFile,
  }));
};
