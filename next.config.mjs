/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 静的HTMLを出力する設定
  images: {
    unoptimized: true, // エクスポート時の画像エラーを防止
  },
};

export default nextConfig;