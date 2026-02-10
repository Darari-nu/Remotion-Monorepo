# LyricExplosionTemplate - 使い方ガイド

リリックビデオ用の「文字爆発エフェクト」を簡単に作れるテンプレートです。

## 基本的な使い方

```jsx
import LyricExplosionTemplate from './LyricExplosionTemplate';

function App() {
  return (
    <LyricExplosionTemplate
      lyrics={[
        "夢を喰らう",
        "バクがいる",
        "路地裏の",
        "サーカスで"
      ]}
    />
  );
}
```

これだけで動きます！

---

## 設定項目一覧

### 1. `lyrics` - 歌詞 (必須)
表示する歌詞の配列。

```jsx
lyrics={[
  "ここに歌詞を",
  "一行ずつ入れる",
  "何行でもOK"
]}
```

---

### 2. `colors` - 色設定
パーティクルの色。配列の順番で文字ごとに色が変わります。

```jsx
// デフォルト（ポップ）
colors={['#FF6B9D', '#C44569', '#FFA07A', '#FFD93D', '#6BCB77']}

// モノクロ
colors={['#FFFFFF', '#CCCCCC', '#999999', '#666666']}

// ネオン
colors={['#00FF41', '#FF006E', '#8338EC', '#00F5FF']}

// パステル
colors={['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9']}
```

---

### 3. `background` - 背景設定

**グラデーション（デフォルト）:**
```jsx
background={{
  type: 'gradient',
  color1: '#0a0a0a',  // 上の色
  color2: '#1a0a1a'   // 下の色
}}
```

**単色:**
```jsx
background={{
  type: 'solid',
  color1: '#000000'
}}
```

**透明（グリーンバック合成用）:**
```jsx
background={{
  type: 'transparent'
}}
```

---

### 4. `physics` - 物理演算パラメータ

爆発の動きを調整できます。

```jsx
physics={{
  velocityX: 8,          // 横方向の速度（大きいほど激しく散る）
  velocityY: 8,          // 縦方向の速度
  velocityYBias: -2,     // 上向きのバイアス（マイナスで上、プラスで下）
  gravity: 0.15,         // 重力（大きいほど早く落ちる）
  airResistance: 0.99,   // 空気抵抗（1に近いほど長く飛ぶ）
  lifeDecay: 0.01,       // 消滅速度の基本値
  lifeDecayRandom: 0.015 // 消滅速度のランダム幅
}}
```

**例: ゆっくり舞い散る**
```jsx
physics={{
  velocityX: 3,
  velocityY: 3,
  gravity: 0.05,
  airResistance: 0.98
}}
```

**例: 激しく爆発**
```jsx
physics={{
  velocityX: 15,
  velocityY: 15,
  gravity: 0.3
}}
```

---

### 5. `text` - テキスト表示設定

中央に表示される歌詞のスタイル。

```jsx
text={{
  fontSize: 80,
  fontFamily: '"Noto Sans JP", sans-serif',
  color: '#FFFFFF',
  glowColor: '#FF6B9D',  // グローの色
  glowBlur: 30           // グローの強さ
}}
```

**小さめの文字:**
```jsx
text={{
  fontSize: 50,
  color: '#FFD700',
  glowColor: '#FF8C00',
  glowBlur: 20
}}
```

---

### 6. `glitch` - グリッチエフェクト設定

```jsx
glitch={{
  enabled: true,         // グリッチを有効化
  duration: 15,          // グリッチの持続時間（フレーム数）
  rgbSplit: 10,          // RGB色ずれの強さ
  noiseLines: 5          // ノイズラインの本数
}}
```

**グリッチを無効化:**
```jsx
glitch={{ enabled: false }}
```

**強烈なグリッチ:**
```jsx
glitch={{
  enabled: true,
  duration: 30,
  rgbSplit: 20,
  noiseLines: 10
}}
```

---

### 7. `particles` - パーティクル設定

```jsx
particles={{
  countPerChar: 3,       // 1文字あたりのパーティクル数
  sizeMin: 30,           // 最小サイズ
  sizeRandom: 20,        // サイズのランダム幅
  positionSpread: 10,    // 初期位置のばらつき
  glowBlur: 20           // パーティクルのグロー
}}
```

**パーティクル多め:**
```jsx
particles={{
  countPerChar: 5,
  sizeMin: 20,
  sizeRandom: 30
}}
```

---

### 8. `autoPlay` - 自動再生設定

```jsx
autoPlay={{
  enabled: true,
  interval: 4000  // 4秒ごとに自動で次へ
}}
```

手動操作したい場合:
```jsx
autoPlay={{ enabled: false }}
```

---

### 9. その他のオプション

**ヒントを非表示:**
```jsx
showHint={false}
```

**ヒントテキストを変更:**
```jsx
hintText="タップで次の歌詞へ"
```

**歌詞変更時のコールバック:**
```jsx
onTextChange={(index) => {
  console.log(`歌詞${index}番に切り替わりました`);
}}
```

---

## 実践例

### 例1: ポップな感じ

```jsx
<LyricExplosionTemplate
  lyrics={["キラキラ", "輝く", "星空"]}
  colors={['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF']}
  background={{
    type: 'gradient',
    color1: '#000033',
    color2: '#330066'
  }}
  physics={{
    velocityX: 6,
    velocityY: 6,
    gravity: 0.1
  }}
/>
```

### 例2: ダークでシリアス

```jsx
<LyricExplosionTemplate
  lyrics={["沈黙", "暗闇", "孤独"]}
  colors={['#8B0000', '#4B0000', '#2B0000', '#0B0000']}
  background={{
    type: 'solid',
    color1: '#000000'
  }}
  text={{
    fontSize: 90,
    color: '#FFFFFF',
    glowColor: '#8B0000',
    glowBlur: 40
  }}
  glitch={{
    enabled: true,
    duration: 20,
    rgbSplit: 15
  }}
/>
```

### 例3: レトロウェーブ

```jsx
<LyricExplosionTemplate
  lyrics={["Neon", "Nights", "Forever"]}
  colors={['#FF00FF', '#00FFFF', '#FFFF00', '#FF1493']}
  background={{
    type: 'gradient',
    color1: '#1a0033',
    color2: '#330066'
  }}
  text={{
    fontSize: 100,
    fontFamily: '"Courier New", monospace',
    color: '#00FFFF',
    glowColor: '#FF00FF',
    glowBlur: 50
  }}
/>
```

### 例4: 自動再生（プレゼン用）

```jsx
<LyricExplosionTemplate
  lyrics={[
    "第一章",
    "始まりの物語",
    "第二章",
    "転換点",
    "終章",
    "そして未来へ"
  ]}
  autoPlay={{
    enabled: true,
    interval: 3000
  }}
  showHint={false}
/>
```

---

## Claude Codeへの指示例

### パターン1: 基本的な変更
```
LyricExplosionTemplateコンポーネントを使って、
以下の歌詞でリリックビデオを作ってください：

歌詞:
- 夢を追いかけて
- 果てしない空へ
- 飛び立とう

色: ピンク、紫、青のグラデーション
背景: 深い夜空のグラデーション
```

### パターン2: 詳細指定
```
LyricExplosionTemplateを使って以下の仕様で作成：

【歌詞】
"Lost in the city"
"Searching for light"
"Never give up"

【色】ネオンカラー（緑、ピンク、シアン、黄色）
【背景】黒からダークパープルのグラデーション
【物理演算】激しめの爆発（velocityX: 12, velocityY: 12）
【グリッチ】強め（duration: 25, rgbSplit: 15）
【自動再生】5秒間隔
```

### パターン3: 既存の変更
```
現在のLyricExplosionTemplateのpropsを以下のように変更：

- colors を モノクロ（白、グレー3段階）に変更
- physics.gravity を 0.3 に変更（早く落ちるように）
- text.fontSize を 60 に変更
```

---

## トラブルシューティング

**文字が見切れる:**
→ `text.fontSize` を小さくするか、歌詞を短くしてください

**動きが遅すぎる:**
→ `physics.velocityX` と `physics.velocityY` を大きくしてください

**すぐ消える:**
→ `physics.lifeDecay` を小さくしてください（例: 0.005）

**背景が表示されない:**
→ `background.type` が `'transparent'` になっていないか確認

---

これで完璧！何度でも使い回せます🎉
