# FallingTextPhysics - クイックリファレンス

## 基本コマンド

### 1. 歌詞だけ変える
```
FallingTextPhysicsの歌詞を以下に変更してください：
- "[1行目]\n[2行目]"
- "[次の歌詞]"
```

### 2. 色を変える
```
colorsを[色系]に変更してください

例: colorsをネオンカラーに変更
例: colorsをパステルピンク系に変更
```

### 3. テンポを変える
```
速いテンポの曲用に調整してください
または
ゆったりしたバラード用に調整してください
```

### 4. 物理演算を変える
```
もっと激しく落ちるようにphysicsを調整してください
または
雪のようにゆっくり積もるようにphysicsを調整してください
```

---

## よく使う色パレット

```jsx
// ポップ
['#FF6B9D', '#00FFFF', '#FFD700', '#FF4500', '#7FFF00']

// ネオン
['#00FF41', '#FF006E', '#8338EC', '#00F5FF', '#FFFF00']

// パステル
['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF']

// モノクロ
['#FFFFFF', '#CCCCCC', '#999999', '#666666', '#333333']

// ファイア
['#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#FFA500']

// サイバー
['#00FFFF', '#FF00FF', '#00FF00', '#FFFF00', '#FF0080']

// 雪
['#FFFFFF', '#F0F8FF', '#E6F3FF', '#DDEEFF', '#D0E8FF']
```

---

## タイミングプリセット

### 速い（ロック、EDM）
```jsx
timing={{
  displayTime: 600,
  dropInterval: 80,
  pauseAfterFall: 2000
}}
```

### 普通（ポップス）
```jsx
timing={{
  displayTime: 1000,
  dropInterval: 150,
  pauseAfterFall: 3500
}}
```

### 遅い（バラード）
```jsx
timing={{
  displayTime: 1800,
  dropInterval: 250,
  pauseAfterFall: 6000
}}
```

---

## 物理プリセット

### ゆっくり積もる（雪）
```jsx
physics={{
  gravity: 0.3,
  bounce: 0.3,
  friction: 0.95,
  rotationSpeed: 0.05
}}
```

### 普通
```jsx
physics={{
  gravity: 0.5,
  bounce: 0.5,
  friction: 0.98,
  rotationSpeed: 0.1
}}
```

### 激しく落ちる
```jsx
physics={{
  gravity: 0.8,
  bounce: 0.7,
  friction: 0.99,
  rotationSpeed: 0.15
}}
```

---

## フォントサイズガイド

| サイズ | 用途 |
|--------|------|
| 40-50 | 長い歌詞、小さめ |
| 55-60 | 標準（推奨） |
| 65-80 | 短い歌詞、インパクト |

---

## Claude Code用の指示例

### シンプル
```
FallingTextPhysicsを使って、以下の歌詞で作ってください：
- "君の名前\n呼び続ける"
- "どこまでも\n追いかける"

色はピンク系で。
```

### テンポ指定
```
FallingTextPhysicsで速いテンポの曲用に作成：

歌詞:
- "Break\nDown"
- "Rise\nUp"

timing.displayTime を 600ms に
timing.dropInterval を 80ms に
physics.gravity を 0.8 に変更
```

### 完全カスタム
```
FallingTextPhysicsで以下の仕様で作成：

【歌詞】
- "路地裏のサーカスで\n踊ろうよ"
- "僕らだけの\nショータイム"

【色】ネオンカラー ['#00FF41', '#FF006E', '#8338EC', '#00F5FF']
【背景】真っ黒 (#000000)
【タイミング】
- displayTime: 1000
- dropInterval: 120
- pauseAfterFall: 3000

【物理】
- gravity: 0.55
- bounce: 0.6
- rotationSpeed: 0.12

【エフェクト】
- glow: true
- shadow: true
- trail: false

【フォントサイズ】60
```

---

## パラメータ早見表

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| lyrics | string[] | 必須 | 歌詞配列（\nで改行） |
| colors | string[] | ポップ5色 | 文字の色 |
| backgroundColor | string | `#0a0a0a` | 背景色 |
| fontSize | number | 55 | フォントサイズ |
| fontFamily | string | Noto Sans JP | フォント |
| timing.displayTime | number | 1000 | 上部表示時間(ms) |
| timing.dropInterval | number | 150 | 落下間隔(ms) |
| timing.pauseAfterFall | number | 3500 | 待機時間(ms) |
| timing.clearDelay | number | 1500 | クリア時間(ms) |
| physics.gravity | number | 0.5 | 重力 |
| physics.bounce | number | 0.5 | 反発係数(0-1) |
| physics.friction | number | 0.98 | 摩擦(0-1) |
| physics.rotationSpeed | number | 0.1 | 回転速度 |
| effects.glow | boolean | true | グロー |
| effects.shadow | boolean | true | 影 |
| effects.trail | boolean | false | 軌跡 |

---

## トラブルシューティング

| 問題 | 解決策 | コマンド例 |
|------|--------|-----------|
| 速く落ちすぎる | gravity を小さく | `physics.gravity を 0.3 に変更` |
| よく跳ねる | bounce を小さく | `physics.bounce を 0.3 に変更` |
| 落ちるのが遅い | dropInterval を小さく | `timing.dropInterval を 100 に変更` |
| 積もる時間が短い | pauseAfterFall を大きく | `timing.pauseAfterFall を 5000 に変更` |
| 文字が読めない | fontSize を大きく | `fontSize を 65 に変更` |
| 2行が重なる | fontSize を小さく | `fontSize を 45 に変更` |

---

## ファイル構成

```
/mnt/user-data/outputs/
├── FallingTextPhysics.jsx         ← メインコンポーネント
├── FallingTextPhysics_GUIDE.md    ← 詳細ガイド
├── FallingTextPhysics_samples.jsx ← サンプル12種
└── FallingTextPhysics_QUICK.md    ← このファイル
```

---

## 主な機能

✨ 完全自動再生  
✨ 2行表示対応  
✨ リアル物理演算  
✨ バウンド & 衝突  
✨ 文字が積もる  
✨ BPM調整可能  

これだけ覚えればOK！🎉
