# コードスタイルと規約

## TypeScript設定
- **Target**: ES2022
- **Module**: ESNext
- **JSX**: react-jsx
- **厳密な型定義**: 必須
- **パスエイリアス**: `@/*` → `./*`

## React コンポーネント規約
- **コンポーネント定義**: `React.FC`を使用
- **Props**: TypeScriptインターフェースで型定義
- **状態管理**: `useState`フック使用
- **副作用処理**: `useEffect`フック使用
- **コールバック最適化**: `useCallback`フック使用

## コーディングスタイル
- **命名規則**:
  - コンポーネント: PascalCase (例: `ChatScreen`)
  - 関数: camelCase (例: `handleSendMessage`)
  - 定数: camelCase (例: `systemInstruction`)
  - Props型: ComponentName + Props (例: `ChatScreenProps`)

- **ファイル構成**:
  - コンポーネントは `components/` ディレクトリに配置
  - APIエンドポイントは `api/` ディレクトリに配置
  - 型定義は `types.ts` に集約

- **スタイリング**:
  - Tailwind CSSクラスを直接使用
  - ダークテーマベース（`bg-gray-900`）
  - レスポンシブデザイン考慮

## エラーハンドリング
- try-catch構文で適切にエラーを捕捉
- エラーメッセージは日本語で統一
- APIエラー時は代替メッセージを表示

## セキュリティ規約
- APIキーは環境変数で管理
- APIキーをソースコードに含めない
- XSS対策はReactのデフォルト機能を活用