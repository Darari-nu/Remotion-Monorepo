# 夢くいバク リリックビデオ

抽象和風テイストの Remotion v4 ベースリリックビデオプロジェクト

## セットアップ

```bash
# 依存パッケージをインストール
npm install
# または
pnpm install
```

## 開発

```bash
# Remotion Studio を起動
npm run dev
```

ブラウザで `http://localhost:3000` が開きます。

## レンダリング

```bash
# MP4 動画を生成（1080p / 30fps / H.264）
npm run build
```

出力先: `out/lyric-video.mp4`

## プロジェクト構成

```
/app
  /assets
    /video         # K01〜K10 映像素材（.mp4）
      /K01, /K02, ... /K10
    夢喰いバク.mp3
  /data            # 解析データ（CSV/SRT/JSON）
    analysis_summary.csv
    beats.csv
    downbeats.csv
    lyrics_char_provisional.srt
    ...
  /src
    /components    # React コンポーネント
    /lib          # ユーティリティ・型定義・パーサー
    RootComposition.tsx
    index.tsx
/config
  app.config.json  # 設定ファイル
/public            # Remotion 用静的ファイル（symlink）
  /assets -> ../app/assets
  /data -> ../app/data
```

## 映像素材の追加方法

1. Midjourney / Niji Video で生成した映像を `app/assets/video/K01/scene.mp4` などに配置
2. `app/src/components/Background.tsx` の `SCENE_VIDEOS` で該当シーンのコメントアウトを外す
3. 例: `K1: "assets/video/K01/scene.mp4",`

## 機能

- 文字単位 SRT 同期歌詞表示
- ビート同期スケールパルス
- サビ区間での自動フォント拡大 & 露出強化
- オンセット連動フラッシュエフェクト
- 和紙グレインテクスチャ
- 和風カラーパレット（藍・墨・金・乳白・桃）

## カスタマイズ

`config/app.config.json` で各種パラメータを調整可能：

- フォントサイズ
- ビート脈動の強度
- 露出補正値
- オンセット閾値
- トランジション速度

## 今後の拡張

- K01〜K10 の映像素材統合
- Skia エフェクト（波紋・インク滲み・白雨）
- メロディ F0 連動の文字位置モジュレーション
- コード変化による色彩補正
