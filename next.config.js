/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // アセットプレフィックスとキャッシュ設定
  generateBuildId: async () => {
    // 毎回ユニークなビルドIDを生成してキャッシュ問題を回避
    return `build-${Date.now()}`
  },

  // ヘッダー設定でキャッシュをコントロール
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
