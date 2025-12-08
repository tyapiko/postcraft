# 管理者機能セットアップガイド

## 完了した実装

✅ データベーステーブル作成
- `admin_users` - 管理者ユーザー管理
- `blog_posts` - ブログ記事
- `courses` - E-ラーニングコース
- `lessons` - コースのレッスン
- `books` - おすすめ書籍

✅ 管理者認証システム
- `lib/admin.ts` - 管理者権限チェック機能
- `app/admin/layout.tsx` - 管理者専用レイアウト
- `components/admin/AdminSidebar.tsx` - 管理者サイドバー
- `app/admin/page.tsx` - 管理者ダッシュボード

## セットアップ手順

### 1. 管理者として自分を登録

#### 方法1: Supabaseダッシュボードから（推奨）

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択
3. 左メニューから「Authentication」→「Users」を選択
4. 自分のアカウントの「User UID」をコピー
5. 左メニューから「SQL Editor」を選択
6. 以下のSQLを実行（UUIDを自分のものに置き換え）:

```sql
INSERT INTO admin_users (id)
VALUES ('あなたのUser UID');
```

#### 方法2: SQLクエリで確認しながら登録

```sql
-- 1. 現在のユーザーを確認
SELECT id, email FROM auth.users ORDER BY created_at DESC;

-- 2. 自分のIDをadmin_usersに登録
INSERT INTO admin_users (id)
VALUES ('上記で確認したあなたのUUID');

-- 3. 登録確認
SELECT u.id, u.email, au.created_at as admin_since
FROM auth.users u
JOIN admin_users au ON u.id = au.id;
```

### 2. 環境変数の設定（オプション）

管理者機能を最大限活用するには、Service Role Keyの設定を推奨します：

1. Supabaseダッシュボード → Settings → API
2. 「service_role」キーをコピー
3. `.env`ファイルに追加:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**注意**: Service Role Keyは非常に強力な権限を持つため、絶対にGitにコミットしないでください。

### 3. 管理画面へアクセス

1. アプリケーションにログイン
2. `/admin` にアクセス
3. 管理者権限があれば、ダッシュボードが表示されます

## 管理画面の機能

### 現在利用可能

- **ダッシュボード** (`/admin`) - 統計情報の表示
  - ブログ記事数
  - コース数
  - レッスン数
  - 書籍数
  - 総閲覧数

### 今後実装予定

以下のページは実装予定です：

- `/admin/posts` - SNS投稿AI管理
- `/admin/blog` - ブログ記事管理
- `/admin/blog/new` - 新規ブログ記事作成
- `/admin/learning` - E-ラーニング管理
- `/admin/learning/new` - 新規コース作成
- `/admin/books` - 書籍管理
- `/admin/books/new` - 新規書籍登録
- `/admin/settings` - 設定

## テーブル構造

### admin_users
管理者権限を持つユーザーのID

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | auth.usersのIDと紐づく |
| created_at | TIMESTAMP | 登録日時 |

### blog_posts
ブログ記事

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| slug | VARCHAR | URL用のスラッグ |
| title | VARCHAR | タイトル |
| excerpt | TEXT | 抜粋 |
| content | TEXT | 本文（Markdown） |
| cover_image | TEXT | カバー画像URL |
| category | VARCHAR | カテゴリ |
| tags | TEXT[] | タグ配列 |
| is_published | BOOLEAN | 公開状態 |
| published_at | TIMESTAMP | 公開日時 |
| view_count | INTEGER | 閲覧数 |

### courses
E-ラーニングコース

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| slug | VARCHAR | URL用のスラッグ |
| title | VARCHAR | タイトル |
| description | TEXT | 説明 |
| thumbnail | TEXT | サムネイル画像 |
| difficulty | VARCHAR | 難易度 |
| duration_minutes | INTEGER | 所要時間 |
| category | VARCHAR | カテゴリ |
| is_published | BOOLEAN | 公開状態 |
| is_free | BOOLEAN | 無料/有料 |
| price | INTEGER | 価格（円） |
| sort_order | INTEGER | 表示順 |

### lessons
コースのレッスン

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| course_id | UUID | コースID |
| title | VARCHAR | タイトル |
| content | TEXT | 本文（Markdown） |
| video_url | TEXT | 動画URL |
| duration_minutes | INTEGER | 所要時間 |
| sort_order | INTEGER | 表示順 |
| is_preview | BOOLEAN | プレビュー可能 |

### books
おすすめ書籍

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| title | VARCHAR | タイトル |
| author | VARCHAR | 著者 |
| description | TEXT | 説明 |
| cover_image | TEXT | カバー画像 |
| amazon_url | TEXT | AmazonリンクURL |
| category | VARCHAR | カテゴリ |
| difficulty | VARCHAR | 難易度 |
| rating | DECIMAL | おすすめ度 |
| is_published | BOOLEAN | 公開状態 |
| sort_order | INTEGER | 表示順 |

## セキュリティ（RLS）

すべてのテーブルでRow Level Security（RLS）が有効になっています：

- **公開コンテンツ**: 誰でも閲覧可能
- **管理操作**: `admin_users`に登録されているユーザーのみ
- **レッスン閲覧**: プレビュー可能なレッスンまたは管理者のみ

## トラブルシューティング

### 管理画面にアクセスできない

1. ログインしているか確認
2. `admin_users`テーブルに自分のUUIDが登録されているか確認
3. ブラウザのコンソールでエラーを確認

### データが表示されない

1. RLSポリシーが正しく設定されているか確認
2. `is_published`フラグが`true`になっているか確認

### Service Role Keyのエラー

Service Role Keyが設定されていない場合、`lib/admin.ts`は自動的に匿名キーを使用します。
基本的な機能は動作しますが、管理者専用の高度な機能を使用する場合はService Role Keyの設定を推奨します。

## 次のステップ

1. 管理者として登録
2. `/admin`にアクセスして動作確認
3. ブログ記事管理画面などの詳細機能を実装
4. コンテンツの投稿・管理を開始
