# RansomNote - 使い方ガイド

新聞の切り抜きを貼り合わせたような、グランジなリリックビデオ用テンプレート

---

## 基本的な使い方

```jsx
import RansomNote from './RansomNote';

<RansomNote
  lyrics={[
    "夢を喰らうバクがいる",
    "眠れない夜に寄り添う"
  ]}
/>
```

これだけで動きます！完全自動再生。

---

## アニメーションの流れ

1. **Entrance（登場）** - フェードイン＋回転＋スケール
2. **Display（表示）** - 微妙に浮遊（揺れる）
3. **Exit（退場）** - 回転しながら飛び散って消える
4. 次の歌詞へ → 繰り返し

**特徴:**
- 各文字がバラバラのフォント、サイズ、角度
- 黒背景白文字と白背景黒文字がランダム
- グレー系の紙スタイル
- 縦書き2列レイアウト
- 登場後も微妙に動いてる

---

## 主な設定項目

### 1. 歌詞

```jsx
lyrics={[
  "1行目の歌詞",
  "2行目の歌詞",
  "長めの歌詞もOK"
]}
```

**ポイント:**
- 1行あたり8-15文字が理想
- 自動的に2列に分割される
- 長すぎると画面からはみ出る可能性

---

### 2. 背景色

```jsx
backgroundColor="#2a2a2a"  // ダークグレー（デフォルト）
```

**おすすめ:**
- ダーク系: `#0a0a0a`, `#1a1a1a`, `#2a2a2a`
- ミディアム: `#3a3a3a`, `#4a4a4a`

---

### 3. 文字サイズ

```jsx
fontSize={{
  min: 30,  // 最小サイズ
  max: 90   // 最大サイズ
}}
```

**サイズの目安:**
- 小さめ: `{ min: 25, max: 70 }`
- 標準: `{ min: 30, max: 90 }` （デフォルト）
- 大きめ: `{ min: 40, max: 110 }`

---

### 4. タイミング設定

```jsx
timing={{
  entranceDuration: 1500,  // 登場時間（ミリ秒）
  displayDuration: 3500,   // 表示時間（ミリ秒）
  exitDuration: 1000,      // 退場時間（ミリ秒）
  staggerDelay: 50        // 文字ごとの遅延（ミリ秒）
}}
```

**テンポ別プリセット:**

```jsx
// 速い（ロック、パンク）
timing={{
  entranceDuration: 1000,
  displayDuration: 2500,
  exitDuration: 800,
  staggerDelay: 30
}}

// 普通（ポップス）
timing={{
  entranceDuration: 1500,
  displayDuration: 3500,
  exitDuration: 1000,
  staggerDelay: 50
}}

// 遅い（バラード）
timing={{
  entranceDuration: 2000,
  displayDuration: 5000,
  exitDuration: 1500,
  staggerDelay: 70
}}
```

---

### 5. アニメーション設定

```jsx
animation={{
  entranceRotation: Math.PI,  // 登場時の回転量
  floatAmplitude: { min: 2, max: 5 },  // 浮遊の振幅
  floatSpeed: { min: 0.01, max: 0.03 }  // 浮遊の速度
}}
```

**動きの調整:**

```jsx
// 激しく動く
animation={{
  entranceRotation: Math.PI * 2,
  floatAmplitude: { min: 5, max: 10 },
  floatSpeed: { min: 0.03, max: 0.05 }
}}

// 穏やか
animation={{
  entranceRotation: Math.PI * 0.5,
  floatAmplitude: { min: 1, max: 3 },
  floatSpeed: { min: 0.005, max: 0.015 }
}}
```

---

### 6. レイアウト設定

```jsx
layout={{
  columnPositions: [0.6, 0.4]  // 右列60%、左列40%の位置
}}
```

**列の位置調整:**
- デフォルト: `[0.6, 0.4]` - 右寄り＋左寄り
- 中央寄せ: `[0.55, 0.45]` - より中央
- 広げる: `[0.7, 0.3]` - より外側

---

### 7. カスタム紙スタイル（上級者向け）

```jsx
paperStyles={[
  { bg: '#FFFFFF', text: '#000000', border: '#000000' },
  { bg: '#000000', text: '#FFFFFF', border: '#FFFFFF' },
  { bg: '#FF0000', text: '#FFFFFF', border: '#FFFFFF' }, // 赤背景
  // 好きなだけ追加可能
]}
```

**カスタムスタイル例:**

```jsx
// パンク系（赤・黒）
paperStyles={[
  { bg: '#000000', text: '#FFFFFF', border: '#FFFFFF' },
  { bg: '#FF0000', text: '#000000', border: '#000000' },
  { bg: '#FFFFFF', text: '#FF0000', border: '#FF0000' },
  { bg: '#FFFFFF', text: '#000000', border: '#000000' }
]}

// パステル系
paperStyles={[
  { bg: '#FFE0E0', text: '#8B0000', border: '#C62828' },
  { bg: '#E0F0FF', text: '#003366', border: '#1976D2' },
  { bg: '#FFF9E0', text: '#8B6914', border: '#F57F17' }
]}
```

---

### 8. カスタムフォント（上級者向け）

```jsx
fonts={[
  '"Arial Black"',
  '"Impact"',
  '"Courier New"',
  // 好きなフォントを追加
]}
```

---

## 実践例

### 例1: だらさんの「夢喰いバク」風

```jsx
<RansomNote
  lyrics={[
    "夢を喰らうバクがいる",
    "眠れない夜に寄り添う",
    "君の不安を食べてあげよう",
    "明日がくるまで一緒にいよう"
  ]}
  backgroundColor="#0a0520"
  fontSize={{
    min: 35,
    max: 95
  }}
  timing={{
    entranceDuration: 1600,
    displayDuration: 4000,
    exitDuration: 1200,
    staggerDelay: 60
  }}
/>
```

### 例2: 路地裏サーカス風

```jsx
<RansomNote
  lyrics={[
    "路地裏のサーカスで",
    "踊ろうよ僕らだけの",
    "ショータイム始まるよ"
  ]}
  backgroundColor="#1a0a0a"
  fontSize={{
    min: 40,
    max: 100
  }}
  animation={{
    entranceRotation: Math.PI * 1.5,
    floatAmplitude: { min: 3, max: 7 },
    floatSpeed: { min: 0.02, max: 0.04 }
  }}
/>
```

### 例3: 高速パンク

```jsx
<RansomNote
  lyrics={[
    "怒りを叫べ",
    "声を上げろ",
    "今すぐに"
  ]}
  backgroundColor="#000000"
  fontSize={{
    min: 45,
    max: 110
  }}
  timing={{
    entranceDuration: 800,
    displayDuration: 2000,
    exitDuration: 600,
    staggerDelay: 25
  }}
/>
```

### 例4: ゆったりバラード

```jsx
<RansomNote
  lyrics={[
    "静かに流れる時の中",
    "君を想う夜が来る",
    "永遠の愛を誓おう"
  ]}
  backgroundColor="#2a2a3a"
  fontSize={{
    min: 30,
    max: 80
  }}
  timing={{
    entranceDuration: 2500,
    displayDuration: 6000,
    exitDuration: 2000,
    staggerDelay: 80
  }}
  animation={{
    entranceRotation: Math.PI * 0.5,
    floatAmplitude: { min: 1, max: 3 },
    floatSpeed: { min: 0.005, max: 0.015 }
  }}
/>
```

---

## Claude Code用の指示テンプレート

### パターン1: シンプル変更
```
RansomNoteを使って、以下の歌詞で作ってください：
- "君の歌詞"
- "ここに"

背景は真っ黒で。
```

### パターン2: テンポ指定
```
RansomNoteで速いテンポの曲用に作成：

歌詞:
- "怒りを叫べ"
- "声を上げろ"

timing.entranceDuration を 800ms に
timing.displayDuration を 2000ms に
timing.staggerDelay を 25ms に変更
```

### パターン3: 完全カスタム
```
RansomNoteで以下の仕様で作成：

【歌詞】
- "夢を追いかけて"
- "果てしない空へ"

【背景】真っ黒 (#000000)

【文字サイズ】
- min: 40
- max: 100

【タイミング】
- entranceDuration: 1500
- displayDuration: 4000
- staggerDelay: 50

【アニメーション】
- 激しく動く設定で
```

---

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| 文字が画面からはみ出る | fontSize.max を小さく（70-80） |
| 動きが激しすぎる | animation.floatAmplitude を小さく |
| 登場が遅い | timing.entranceDuration を小さく |
| 表示時間が短い | timing.displayDuration を大きく |
| 文字が読みづらい | fontSize.min を大きく（35-40） |
| 動きが遅い | animation.floatSpeed を大きく |

---

## おすすめの使い方

✨ パンク、グランジ、ロック系に最適  
✨ 攻撃的な曲、激しい曲に  
✨ アート系、実験的なMVに  
✨ 日本語の縦書きが映える  

最高にカッコいいリリックビデオが作れます！🔥
