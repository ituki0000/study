# 予定管理システム

React + TypeScript（フロントエンド）と Node.js + Express（バックエンド）で構築した予定管理システムです。

## 機能

### ✨ 主な機能
- **予定の作成・編集・削除**: 詳細な予定情報を管理
- **予定の完了管理**: チェックボックスで完了状態を切り替え
- **カテゴリ分類**: 仕事、個人、会議、リマインダー、その他で分類
- **優先度設定**: 高・中・低の3段階で優先度を設定
- **検索・フィルタリング**: タイトル・説明での検索、各種フィルター機能
- **期間フィルター**: 今日、今週、今月での期間絞り込み
- **レスポンシブデザイン**: デスクトップ・タブレット・スマートフォン対応

### 🎯 技術スタック
- **フロントエンド**: React 18, TypeScript, Tailwind CSS, Vite
- **バックエンド**: Node.js, Express, TypeScript
- **アイコン**: Lucide React
- **日付処理**: date-fns
- **HTTP クライアント**: Axios
- **バリデーション**: express-validator
- **開発ツール**: ESLint, nodemon, concurrently

## 🚀 セットアップ手順

### 前提条件
- Node.js (v18以上)
- npm

### 1. 依存関係のインストール

```bash
# ルートディレクトリで実行
npm run install:all
```

または、個別にインストール：

```bash
# ルートの依存関係
npm install

# フロントエンドの依存関係
cd frontend && npm install

# バックエンドの依存関係
cd ../backend && npm install
```

### 2. 開発サーバーの起動

```bash
# ルートディレクトリで実行（フロントエンドとバックエンドを同時に起動）
npm run dev
```

または、個別に起動：

```bash
# バックエンドのみ起動（ポート 3001）
npm run dev:backend

# フロントエンドのみ起動（ポート 3000）
npm run dev:frontend
```

### 3. アプリケーションにアクセス

- **フロントエンド**: http://localhost:3000
- **バックエンド API**: http://localhost:3001/api

## 📁 プロジェクト構造

```
schedule-management-system/
├── frontend/                  # React フロントエンド
│   ├── src/
│   │   ├── components/       # Reactコンポーネント
│   │   │   ├── FilterBar.tsx     # フィルターバー
│   │   │   ├── ScheduleForm.tsx  # 予定作成・編集フォーム
│   │   │   └── ScheduleList.tsx  # 予定リスト
│   │   ├── services/         # API通信サービス
│   │   │   └── api.ts
│   │   ├── types/           # TypeScript型定義
│   │   │   └── schedule.ts
│   │   ├── App.tsx          # メインアプリケーション
│   │   ├── main.tsx         # エントリーポイント
│   │   └── index.css        # グローバルスタイル
│   ├── index.html           # HTMLテンプレート
│   ├── vite.config.ts       # Vite設定
│   └── tailwind.config.js   # Tailwind CSS設定
├── backend/                 # Node.js バックエンド
│   ├── src/
│   │   ├── routes/          # APIルート
│   │   │   └── schedules.ts
│   │   ├── services/        # ビジネスロジック
│   │   │   └── scheduleService.ts
│   │   ├── types/           # TypeScript型定義
│   │   │   └── schedule.ts
│   │   └── index.ts         # サーバーエントリーポイント
│   ├── tsconfig.json        # TypeScript設定
│   └── nodemon.json         # nodemon設定
└── package.json             # ルートパッケージ設定
```

## 🔧 開発

### ビルド

```bash
# 全体をビルド
npm run build

# フロントエンドのみビルド
npm run build:frontend

# バックエンドのみビルド
npm run build:backend
```

### 型チェック

```bash
# フロントエンド
cd frontend && npm run lint

# バックエンド
cd backend && npm run type-check
```

## 📡 API エンドポイント

### 予定管理
- `GET /api/schedules` - 予定一覧を取得（クエリパラメータでフィルタリング可能）
- `GET /api/schedules/:id` - 特定の予定を取得
- `POST /api/schedules` - 新しい予定を作成
- `PUT /api/schedules/:id` - 予定を更新
- `DELETE /api/schedules/:id` - 予定を削除

### システム
- `GET /api/health` - サーバーの健康状態をチェック

### クエリパラメータ例
```
GET /api/schedules?category=work&priority=high&isCompleted=false&search=会議
```

## ⚙️ 設定可能項目

### カテゴリ
- `work` - 仕事
- `personal` - 個人
- `meeting` - 会議  
- `reminder` - リマインダー
- `other` - その他

### 優先度
- `high` - 高
- `medium` - 中
- `low` - 低

## 🤝 貢献

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 📞 サポート

何か問題や質問がある場合は、GitHub Issues を使用してお知らせください。

---

**Happy Scheduling! 📅✨** 