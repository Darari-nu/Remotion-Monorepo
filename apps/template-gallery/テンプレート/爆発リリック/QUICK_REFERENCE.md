# Claude Code用 クイックリファレンス

## 基本コマンド

### 1. 歌詞だけ変える
```
LyricExplosionTemplateの歌詞を以下に変更してください：
- [歌詞1]
- [歌詞2]
- [歌詞3]
```

### 2. 色だけ変える
```
LyricExplosionTemplateのcolorsを以下に変更：
colors={['#色1', '#色2', '#色3']}
```

### 3. 背景を変える
```
backgroundを[色]の単色に変更してください
または
backgroundを[色1]から[色2]へのグラデーションに変更してください
```

### 4. 動きを変える
```
もっと激しく爆発するように physics を調整してください
または
ゆっくり舞い散るように physics を調整してください
```

### 5. 自動再生にする
```
autoPlayを有効にして、[N]秒ごとに自動で次の歌詞に進むようにしてください
```

---

## よく使う色パレット

### ポップ
`['#FF6B9D', '#C44569', '#FFA07A', '#FFD93D', '#6BCB77']`

### ネオン
`['#00FF41', '#FF006E', '#8338EC', '#00F5FF']`

### パステル
`['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF']`

### モノクロ
`['#FFFFFF', '#CCCCCC', '#999999', '#666666']`

### ダーク
`['#8B0000', '#DC143C', '#FF4500', '#FF6347']`

### レトロウェーブ
`['#FF00FF', '#00FFFF', '#FFFF00', '#FF1493']`

---

## よく使う背景

### 暗い夜空
```jsx
background={{
  type: 'gradient',
  color1: '#0a0520',
  color2: '#1a0a3a'
}}
```

### 真っ黒
```jsx
background={{
  type: 'solid',
  color1: '#000000'
}}
```

### グリーンバック
```jsx
background={{
  type: 'solid',
  color1: '#00FF00'
}}
```

### 透明
```jsx
background={{
  type: 'transparent'
}}
```

---

## 物理パラメータ早見表

### ゆっくり舞い散る
```jsx
physics={{
  velocityX: 3,
  velocityY: 3,
  gravity: 0.05,
  airResistance: 0.98
}}
```

### 普通
```jsx
physics={{
  velocityX: 7,
  velocityY: 7,
  gravity: 0.15,
  airResistance: 0.99
}}
```

### 激しく爆発
```jsx
physics={{
  velocityX: 15,
  velocityY: 15,
  gravity: 0.3,
  airResistance: 0.96
}}
```

---

## グリッチ設定

### なし
```jsx
glitch={{ enabled: false }}
```

### 弱め
```jsx
glitch={{
  enabled: true,
  duration: 10,
  rgbSplit: 5,
  noiseLines: 3
}}
```

### 強め
```jsx
glitch={{
  enabled: true,
  duration: 30,
  rgbSplit: 20,
  noiseLines: 10
}}
```

---

## テンプレート指示の例

**シンプルな変更:**
```
LyricExplosionTemplateを使って、以下の歌詞のリリックビデオを作ってください：
- 桜舞う
- 春の風
- 君と歩く

色はピンク系で。
```

**詳細指定:**
```
LyricExplosionTemplateで以下を実装：

歌詞: ["Lost", "Found", "Again"]
色: ネオンカラー ['#00FF41', '#FF006E', '#8338EC']
背景: 真っ黒
文字サイズ: 100
グリッチ: 強め
物理: 激しめの爆発
```

**既存の修正:**
```
現在のLyricExplosionTemplateを以下のように修正：
1. colors を モノクロに変更
2. physics.gravity を 0.3 に変更
3. text.fontSize を 60 に変更
```

---

## ファイル構成

```
/mnt/user-data/outputs/
├── LyricExplosionTemplate.jsx  ← メインコンポーネント
├── USAGE_GUIDE.md              ← 詳細ガイド
├── samples.jsx                  ← サンプル実装集
└── QUICK_REFERENCE.md          ← このファイル
```

---

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| 文字が見切れる | `text.fontSize` を小さく |
| 動きが遅い | `physics.velocityX`, `physics.velocityY` を大きく |
| すぐ消える | `physics.lifeDecay` を小さく（例: 0.005） |
| 背景が見えない | `background.type` を確認 |
| パーティクルが少ない | `particles.countPerChar` を増やす |

---

これだけ覚えれば完璧！🎉
