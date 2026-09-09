import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { injectAffiliateLinks } from './injectAffiliates.mjs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// GitHub Actionsから渡された環境変数を見て、50回か1回かを決定
const runCount = process.env.IS_BURST === 'true' ? 50 : 1;

// 画像リストの読み込み（Xserverにアップ済みの画像のパスリスト）
const mediaPath = path.resolve(process.cwd(), 'src/data/media.json');
let availableImages = [];
if (fs.existsSync(mediaPath)) {
  availableImages = JSON.parse(fs.readFileSync(mediaPath, 'utf8'));
}

async function generateSingleArticle(index) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  // プロンプトに「使える画像リスト」を渡し、適切にMarkdownで差し込ませる
  const prompt = `
    あなたはプロのブログライターです。個人や中小企業に役立つビジネス・ITスキルの記事をMarkdown形式で作成してください。
    
    【要件】
    - 見出し（H2, H3）を適切に使うこと。
    - 以下の画像を、文脈に合わせて1〜2枚適切にMarkdown形式 (![alt](URL)) で挿入してください。
    【利用可能な画像URLリスト】
    ${availableImages.map(img => `- ${img.url} (内容: ${img.alt})`).join('\n')}
  `;

  const result = await model.generateContent(prompt);
  let content = result.response.text();

  // ★ここでアフィリエイトリンクを自動挿入
  content = injectAffiliateLinks(content);

  // ファイル名の生成と保存
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `post-${dateStr}-${index}.md`;
  const dirPath = path.resolve(process.cwd(), 'content/posts');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(path.join(dirPath, filename), content);
  console.log(`✅ 記事生成完了: ${filename}`);
  
  // API制限回避のための待機時間（3秒）
  await new Promise(resolve => setTimeout(resolve, 3000));
}

async function main() {
  console.log(`🚀 生成開始: ${runCount}記事を生成します...`);
  for (let i = 1; i <= runCount; i++) {
    console.log(`⏳ ${i}/${runCount} 記事目を生成中...`);
    try {
      await generateSingleArticle(i);
    } catch (error) {
      console.error(`❌ エラー発生（${i}回目）:`, error);
    }
  }
  console.log('🎉 すべての生成プロセスが完了しました！');
}

main();