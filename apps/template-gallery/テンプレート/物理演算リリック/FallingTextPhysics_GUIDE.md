# FallingTextPhysics - 使い方ガイド

文字が落ちてバウンドして積もるリリックビデオ用テンプレート

---

## 基本的な使い方

```jsx
import FallingTextPhysics from './FallingTextPhysics';

<FallingTextPhysics
  lyrics={[
    "君の歌詞を\nここに",
    "2行目も\n書ける"
  ]}
/>
```

これだけで動きます！完全自動再生。

---

## アニメーションの流れ

1. **Display（表示）** - 上部に歌詞が2行で表示される（1秒）
2. **Falling（落下）** - 左から一文字ずつボトボト落ちる
3. **Physics（物理）** - 地面でバウンド、積み重なる、ぶつかる
4. **Waiting（待機）** - 積もった状態でしばらく待つ（3.5秒）
5. **Clearing（クリア）** - フェードアウト → 次の歌詞へ

---

## 主な設定項目

### 1. 歌詞（必須）

```jsx
lyrics={[
  "1行目\n2行目",
  "短い歌詞",  // 1行でもOK
  "長い歌詞は\n2行に分けよう"
]}
```

**ポイント:**
- `\n` で改行
- 1行でも2行でもOK
- 長い歌詞は2行推奨（読みやすい）

---

### 2. 色設定

```jsx
colors={['#FF6B9D', '#00FFFF', '#FFD700', '#FF4500', '#7FFF00']}
backgroundColor="#0a0a0a"
```

**よく使う組み合わせ:**

```jsx
// ポップ（デフォルト）
colors={['#FF6B9D', '#00FFFF', '#FFD700', '#FF4500', '#7FFF00']}

// ネオン
colors={['#00FF41', '#FF006E', '#8338EC', '#00F5FF', '#FFFF00']}

// パステル
colors={['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF']}

// モノクロ
colors={['#FFFFFF', '#CCCCCC', '#999999', '#666666', '#333333']}

// ファイア
colors={['#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#FFA500']}
```

---

### 3. タイミング設定

```jsx
timing={{
  displayTime: 1000,      // 上部表示時間（ミリ秒）
  dropInterval: 150,      // 文字が落ちる間隔
  pauseAfterFall: 3500,   // 積もった後の待機時間
  clearDelay: 1500        // クリア開始までの時間
}}
```

**テンポに合わせる:**

| 曲のテンポ | 設定例 |
|-----------|--------|
| 速い（ロック、EDM） | `displayTime: 800, dropInterval: 100, pauseAfterFall: 2000` |
| 普通（ポップス） | `displayTime: 1000, dropInterval: 150, pauseAfterFall: 3500` |
| 遅い（バラード） | `displayTime: 1500, dropInterval: 250, pauseAfterFall: 5000` |

---

### 4. 物理演算設定

```jsx
physics={{
  gravity: 0.5,        // 重力（大きいほど速く落ちる）
  bounce: 0.5,         // 反発係数（0-1、大きいほどよく跳ねる）
  friction: 0.98,      // 摩擦（小さいほど早く止まる）
  rotationSpeed: 0.1   // 回転速度
}}
```

**プリセット:**

```jsx
// ゆっくり積もる（雪みたい）
physics={{ gravity: 0.3, bounce: 0.3, friction: 0.95, rotationSpeed: 0.05 }}

// 普通（デフォルト）
physics={{ gravity: 0.5, bounce: 0.5, friction: 0.98, rotationSpeed: 0.1 }}

// 激しく落ちる（勢いある）
physics={{ gravity: 0.8, bounce: 0.7, friction: 0.99, rotationSpeed: 0.2 }}
```

---

### 5. テキスト設定

```jsx
fontSize={55}
fontFamily='"Noto Sans JP", "Arial Black", sans-serif'
```

**フォントサイズの目安:**
- 40-50: 小さめ（長い歌詞向け）
- 55-60: 標準（デフォルト）
- 65-80: 大きめ（短い歌詞、インパクト重視）

---

### 6. エフェクト

```jsx
effects={{
  glow: true,      // グロー（光る）
  shadow: true,    // 影
  trail: false     // 軌跡エフェクト
}}
```

- **glow**: 文字が光る。派手になる
- **shadow**: 立体感が出る
- **trail**: 軌跡が残る。幻想的だけど文字が見づらくなることも

---

## 実践例

### 例1: だらさんの「夢喰いバク」風

```jsx
<FallingTextPhysics
  lyrics={[
    "夢を喰らう\nバクがいる",
    "眠れない夜に\nそっと寄り添う",
    "君の不安を\n食べてあげよう"
  ]}
  colors={['#FF6B9D', '#C44569', '#8B4789', '#6B5B95', '#4A5899']}
  backgroundColor="#0a0520"
  fontSize={58}
  timing={{
    displayTime: 1200,
    dropInterval: 150,
    pauseAfterFall: 4000
  }}
  physics={{
    gravity: 0.45,
    bounce: 0.4,
    rotationSpeed: 0.08
  }}
/>
```

### 例2: 高速ロック

```jsx
<FallingTextPhysics
  lyrics={[
    "Break\nDown",
    "Rise\nUp",
    "Never\nStop"
  ]}
  colors={['#FF0000', '#FF4500', '#FF8C00', '#FFD700']}
  backgroundColor="#000000"
  fontSize={70}
  timing={{
    displayTime: 600,
    dropInterval: 80,
    pauseAfterFall: 2000
  }}
  physics={{
    gravity: 0.8,
    bounce: 0.7,
    rotationSpeed: 0.15
  }}
  effects={{
    glow: true,
    shadow: true,
    trail: false
  }}
/>
```

### 例3: ゆったりバラード

```jsx
<FallingTextPhysics
  lyrics={[
    "静かに流れる\n時の中",
    "君を想う\n夜が来る",
    "永遠の愛を\n誓おう"
  ]}
  colors={['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9']}
  backgroundColor="#1a1a2e"
  fontSize={52}
  timing={{
    displayTime: 1800,
    dropInterval: 250,
    pauseAfterFall: 6000
  }}
  physics={{
    gravity: 0.3,
    bounce: 0.3,
    friction: 0.95,
    rotationSpeed: 0.05
  }}
/>
```

### 例4: ネオンナイト

```jsx
<FallingTextPhysics
  lyrics={[
    "Neon\nLights",
    "City\nNights",
    "Electric\nDreams"
  ]}
  colors={['#00FF41', '#FF006E', '#8338EC', '#00F5FF', '#FFFF00']}
  backgroundColor="#000000"
  fontSize={65}
  effects={{
    glow: true,
    shadow: false,
    trail: true
  }}
/>
```

### 例5: モノクロミニマル

```jsx
<FallingTextPhysics
  lyrics={[
    "Simple\nClean",
    "Pure\nArt",
    "Black\nWhite"
  ]}
  colors={['#FFFFFF', '#DDDDDD', '#BBBBBB', '#999999']}
  backgroundColor="#000000"
  fontSize={60}
  physics={{
    gravity: 0.4,
    bounce: 0.4,
    rotationSpeed: 0.03
  }}
  effects={{
    glow: false,
    shadow: true,
    trail: false
  }}
/>
```

---

## Claude Code用の指示テンプレート

### パターン1: シンプル変更
```
FallingTextPhysicsを使って、以下の歌詞で作ってください：
- [歌詞1行目]\n[2行目]
- [歌詞2]

色はピンク系で。
```

### パターン2: テンポ指定
```
FallingTextPhysicsで速いテンポの曲用に作成：

歌詞: 
- "Break\nDown"
- "Rise\nUp"

timing.displayTime を 600ms に
timing.dropInterval を 80ms に
physics.gravity を 0.8 に変更
```

### パターン3: 完全カスタム
```
FallingTextPhysicsで以下の仕様で作成：

【歌詞】
- "夢を追いかけて\n果てしない空へ"
- "飛び立とう\n今すぐに"

【色】ネオンカラー（緑、ピンク、シアン、黄色）
【背景】真っ黒
【タイミング】
- 表示: 1.2秒
- 落下間隔: 150ms
- 待機: 4秒

【物理】
- 重力: 0.45
- バウンス: 0.4
- 回転: 控えめ

【エフェクト】グローON、軌跡OFF
```

---

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| 文字が速く落ちすぎる | `physics.gravity` を小さく（0.3-0.4） |
| よく跳ねすぎる | `physics.bounce` を小さく（0.3-0.4） |
| 落ちるのが遅い | `timing.dropInterval` を小さく（100-120） |
| 積もる時間が短い | `timing.pauseAfterFall` を大きく（5000-7000） |
| 文字が読めない | `fontSize` を大きく、`colors` を明るく |
| 2行が重なる | `fontSize` を小さく（45-50） |
| カクカクする | `particleSize` を小さく、エフェクトを減らす |

---

## ポイント

✨ 完全自動再生  
✨ リアルな物理演算  
✨ 文字が積もる楽しさ  
✨ BPMに合わせて調整可能  
✨ 2行表示で長い歌詞もOK  

最高のリリックビデオが作れます！🎉
