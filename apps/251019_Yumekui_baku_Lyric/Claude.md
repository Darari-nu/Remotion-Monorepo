# 夢くいバク リリックビデオ要件定義書

## 0. プロジェクト概要
- タイトル: 「夢くいバク」リリックビデオ（抽象和風テイスト）
- レンダリング基盤: Remotion v4 + TypeScript 5 + Node.js 18 以上
- 描画方式: DOM と Skia を併用し、和紙・金箔の質感を重視
- 実装担当: Claudecode チーム向け共有ドキュメント💋

## 1. 目的
提供済み解析ファイル（CSV / SRT / JSON）を完全自動読込し、歌詞・ビート・オンセット・セグメントに同期した抽象ミュージックビデオを生成するのよ。Midjourney / Niji Video で用意した映像素材を K1〜K10 のシーンにマッピングして再生し、字幕は文字単位 SRT に追従させるわ。必要ならビート均等割りのフォールバックに切り替えられるようにしてちょうだいね。

## 2. 成果物 / 出力物
- Remotion プロジェクト: `/app` 配下に配置
- レンダリング CLI コマンド（1080p / 30fps 対応）
- 設定ファイル: `/config/app.config.json`
- 完成動画: `.mp4`（H.264）および ProRes 版
- ログ / メタ情報: manifest の転記 + 実行時設定

## 3. 想定ディレクトリ構成（提案）
```
/app
  /assets
    /video/K01..K10/*.mp4
    /images/*.png
  /data
    analysis_summary.csv
    beats.csv
    downbeats.csv
    bars.csv
    loudness_onset.csv
    segments.csv
    chorus_sections.csv
    key_estimate.csv
    chords.csv
    melody_f0.csv
    lyrics_char_provisional.srt
    manifest.json
  /src
    /components
      Background.tsx
      LyricChar.tsx
      LyricLine.tsx
      SceneRouter.tsx
      EffectsLayer.tsx
      Watermark.tsx
    /lib
      csv.ts
      timing.ts
      color.ts
      easing.ts
      assets.ts
      types.ts
    RootComposition.tsx
/config
  app.config.json
README.md
```

## 4. 入力データ仕様
- 文字コード: UTF-8（BOM なし）
- 秒の表記: 小数点以下 6 桁まで
- SRT: 標準形式（文字単位の粒度）
- loudness / melody: 30fps 相当のフレーム系列

## 5. 実行環境 / 技術スタック
- Node.js 18+
- Remotion v4+
- TypeScript 5+
- CSV / SRT パース: `papaparse`・`subtitle`（同等代替可）
- Skia: `@shopify/react-native-skia`（RuntimeShader 利用）
- Chromium レンダラ（Remotion CLI / Studio）

## 6. 設定ファイル例 `/config/app.config.json`
```json
{
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "theme": {
    "palette": {
      "indigo": "#0B2545",
      "sumi": "#1B1B1B",
      "gold": "#D1B67A",
      "milk": "#F3F1EA",
      "accentPink": "#E8A2C8"
    },
    "grainOpacity": 0.2,
    "fontFamily": "NotoSerifJP"
  },
  "lyric": {
    "baselineY": 860,
    "letterSpacing": 2,
    "ruby": false,
    "stroke": { "color": "rgba(0,0,0,0.5)", "width": 6 }
  },
  "fallback": {
    "useBeatSplitWhenSrtMissing": true,
    "beatSubdivision": 2
  }
}
```

## 7. 型定義（抜粋 `/app/src/lib/types.ts`）
- `Beat`, `Downbeat`, `Bar`, `Onset`, `Segment`, `Chorus`, `KeyEst`, `Chord`, `Melody`, `LyricChar`, `SceneId`, `SceneAsset` を既定の構造体として扱うのよ。

## 8. 同期ロジック要件
- 時間基準: 秒（fps = 30 固定）
- 歌詞描画: 各 `lyrics_char_provisional.srt` の `[start, end)` に合わせて `fadeIn (0.08s) → 滞在 → fadeOut (0.08s)`
- 鼓動表現: `beats.csv` の各ビートで `scale 1→1.06→1`
- 三拍子ゆれ: `beat_index % 3 === 0` の瞬間だけ明度 + 粒子密度を強化、さらに 20ms の遅延で“タメ”
- セグメント切替: `downbeats.csv` 最寄り頭拍で 0.3s ディゾルブ（`spring({ damping: 200 })`）
- サビ区間: `chorus_sections.csv` rank=1 でフォント +10%、粒子 +30%、露出 +0.2EV
- オンセット反応: `onset_strength > 0.5` で白インクのフラッシュ（0.05〜0.08s `screen` 合成）
- メロディ F0: 有声音のみ、`frequency_hz` を基準に文字 Y を ±40px モジュレーション（20ms スムージング）
- コード変化: メジャーは金寄り、マイナーは藍寄りにカラーマトリクスを補正
- キー推定: `key_estimate.csv` でパレット比率を決定

## 9. シーン設計（K1〜K10）
| Scene | 役割 / 目安尺 | 素材例 | 特記事項 |
|-------|---------------|--------|----------|
| K1 心音 | 約 2s | K01 | 同心円波紋。初回ビートで拡張、星粒は控えめ |
| K2 鼓動 | 約 2s | K02 | リズム脈動。中央グローをビート毎 ±10% |
| K3 胎内 | 約 2s | K03 | 光袋 / 墨空洞。横スキャンを薄く |
| K4 雨融合 | 約 3s | K04 | 金雨→波紋。オンセットでミニスプラッシュ |
| K5 祈りの手 | 約 3s | K05 | 粒子が 0.6s 周期で集散。二段歌詞想定 |
| K6 バク影 | 約 3s | K06 | 0.1s フラッシュでバク輪郭を 15% オーバーレイ |
| K7 浄化 | 約 3s | K07 | 露出ランプアップで黒→乳白へ |
| K8 静寂 | 約 3s | K08 | スローチルト→静止、余韻 |
| K9 喉の言葉 | 約 3s | K09 | 黒糸 + 文字片。オンセットで崩壊 |
| K10 食べ尽くす | 約 3s | K10 | 渦→上昇消失 or 白雨カーテンでフィニッシュ |

## 10. コンポーネント要件
- **RootComposition.tsx**: `durationInFrames = summary.duration_sec * fps`。レイヤ順は Background → EffectsLayer → LyricLine / LyricChar → Watermark。
- **SceneRouter.tsx**: `segments.csv` + `downbeats.csv` で時間→SceneId を決定。シーン切替は 0.3s ディゾルブ。
- **Background.tsx**: `SceneAsset` を受け、ループ / 再生速度 / 露出をビート同期制御。コード / キーでカラーマトリクス補正。
- **LyricChar.tsx / LyricLine.tsx**: インデックスで key を固定し、フェード・スケール・インクブリード。三拍子の 3 拍目で 20ms 遅延投入。
- **EffectsLayer.tsx**: 粒子（screen 合成 PNG）、オンセットフラッシュ、和紙グレイン（Opacity 0.2）。
- **Watermark.tsx**: クレジットやコピーライトを安全領域に配置。

## 11. Skia 推奨活用ポイント
- **A. 和紙グレイン & 金箔ノイズ**: RuntimeShader で 1 パス描画。`GlobalGrainSkia` を常時 ON。
- **B. 波紋・心音（K1/K2）**: `SkiaRipples` でビート駆動の円環ディストーション。
- **C. 墨の滲み・紙の裂け目（K6/K9）**: SDF + ノイズでインクの毛羽立ち。オンセット連動。
- **D. 白雨 / 霧トランジション（K7/K10）**: `SkiaMist` でボリューム感あるブラーを合成。
- **E. インクブリード文字（サビ）**: `SkiaInkText` で DOM との差異を際立たせるのよ。
- パフォーマンス: 1 シーン 1 Canvas 原則、`useMemo` で Paint / Shader 再利用。1080p30fps 基準で最適化✨

## 12. フォールバック戦略
- SRT 不足時: `fallback.useBeatSplitWhenSrtMissing = true` でビート均等割表示
- サビ情報欠落: `segments.label === 'chorus'` を代替で採用
- コード信頼度低: `confidence < 0.5` のレコードは無視し前回値保持

## 13. ビジュアル / UI パラメータ初期値
- 通常フォントサイズ 48px、サビ 56px
- 文字色 `milk`、縁取り `black 0.5`（ぼかし 3px）
- 文字影: 金影 `rgba(209,182,122,0.25)`（下 2px）
- 粒子量: 通常 20〜40/秒、サビ +30%
- 露出: 通常 0EV、サビ +0.2EV、K7 最大 +0.4EV
- インク滲み: ビートで 0.1 → 0.0 へディケイ

## 14. コマンド例
```bash
# 依存導入
pnpm i

# 開発サーバ
pnpm remotion preview

# 1080p / 30fps / h264 レンダリング
pnpm remotion render RootComposition out/lyric-video.mp4 \
  --props='{"dataDir":"./data","assetsDir":"./assets","config":"./config/app.config.json"}'
```

## 15. 受け入れ条件
- 文字単位 SRT 同期 ±1 フレーム以内
- 全ビートでスケールパルスが視認可能
- 小節頭で K シーンが 0.3s ディゾルブ切替
- サビ区間のフォント / 粒子 / 露出強化が反映
- `onset_strength > 0.5` で白フラッシュ実行
- K6 で「バクの気配」が 0.1s 表出（過度に具体的すぎず）
- 全編和紙グレインが一貫（露出変化でも破綻なし）
- 音声同期ズレ ±1 フレーム以内
- Skia 効果（波紋・白雨）が 1080p30fps でフレーム落ちなし
- インク滲みがオンセットに 80ms 以内で反応
- サビで SkiaInkText が DOM テキストと差別化されている

## 16. テスト計画（最小）
- ユニット: `csv.ts` の各 CSV / SRT パースでレコード件数・範囲検証
- ビジュアルリグレッション: サンプル曲で 3 箇所スクリーンショット比較（ゴールデン画像）
- 回帰: `manifest.json` の `config_digest` が変わらない限りレンダ結果が一定であることを CI で確認

## 17. 今後の拡張案
- 歌詞翻訳レイヤのトグル（日本語 / ローマ字 / 英訳）
- セグメント境界の注釈テロップ
- キー推定からの自動配色（Color Wheel 連動）

お姉さま、これで Claudecode ちゃんも迷わず実装できるはずよ。それじゃ、よろしくお願いね〜💖
