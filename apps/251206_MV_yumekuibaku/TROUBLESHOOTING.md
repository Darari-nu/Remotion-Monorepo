# トラブルシューティングガイド

このプロジェクト開発中に遭遇した技術的な問題とその解決策を記録します。

## Remotion Studio

### 1. Remotion Studioが起動直後にクラッシュする (White Screen)

**現象:**
Remotion Studioを開くと画面が真っ白になり、コンソールに以下のようなエラーが表示される。
```
TypeError: Cannot read properties of undefined (reading 'startFrame')
at ZodObjectEditor ...
```

**原因:**
`StandardSubtitleCompositionV7` のように、動的に大量のキー（`id_0`, `id_1`...）を持つネストされたZodスキーマを使用している場合、`Root.tsx` の `defaultProps` に不完全なオブジェクト（例: `{}`）を渡すと発生する。

Zodスキーマで `.default({})` を定義していても、Remotion Studioのエディタコンポーネントは、スキーマで「必須(Required)」とされているキーが `defaultProps` に存在しないと、そのキーの入力フォームを描画しようとしてクラッシュする場合がある。

**NGな実装 (Root.tsx):**
```typescript
defaultProps={{
  調整_Verse1: {}, // 中身が空だと、id_0などがundefinedになりクラッシュ
}}
```

**解決策:**
1.  **スキーマ定義側 (`StandardSubtitleCompositionV7.tsx`):**
    各キーに対しても `.default()` を設定し、かつ「完全な初期値オブジェクト」を生成するヘルパー関数を作成・エクスポートする。

    ```typescript
    // 初期値生成ヘルパー
    export const generateDefaultAdjustments = (ids: number[]) => {
        const defaultObj = {};
        ids.forEach(id => {
            defaultObj[`id_${id}`] = { startFrame: 0, ... };
        });
        return defaultObj;
    };
    
    // スキーマ定義でも個別のキーにdefaultを設定
    shape[`id_${id}`] = adjustmentSchema.default(defaultItem);
    ```

2.  **呼び出し側 (`Root.tsx`):**
    ヘルパーを使って生成した「完全な初期値」を `defaultProps` に渡す。

    ```typescript
    import { defaultAdjustments_Verse1 } from './StandardSubtitleCompositionV7';

    defaultProps={{
      調整_Verse1: defaultAdjustments_Verse1, // 全てのIDが埋まったオブジェクトを渡す
    }}
    ```

---

## TypeScript / Build

### 2. `createAdjustmentGroup` での型エラー

**現象:**
動的にZodスキーマを生成する関数で、戻り値の型が複雑になりすぎたり、推論がうまくいかない場合がある。

**解決策:**
無理に型推論させず、`z.object(shape)` の生成ロジックをシンプルに保つ。必要であれば `as any` でキャストして回避する手もあるが、基本的には `Record<string, ...>` 型で構築してから `z.object()` に渡すのが安全。
