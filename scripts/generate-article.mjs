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
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  // ★ プロンプト修正：タイトルへのHTML混入を厳格に禁止し、重複したルールを整理
  const prompt = `
あなたはリスキリング特化のプロのブログライターです。リスキリングに役立つITスキルやマーケティングスキル、マインドや経理など、その他必要な事をメインテーマにした記事をMarkdown形式で作成してください。

【厳守事項 - 以下のルールを絶対に守ってください】
1. AIとしての返事（「承知しました」「以下の通り作成します」など）や挨拶は一切含めないでください。記事のコンテンツ（Markdown）のみを出力してください。
2. 記事の先頭には必ず以下の形式でタイトルとカテゴリー（1つ）を記述してください。これがないとシステムがエラーになります。
---
title: "ここに魅力的で具体的な記事のタイトルを記載"
category: "ここに記事のカテゴリーを記載（例：マーケティング、マインドセット、SEO、資金調達など）"
---
※【超重要】titleの中身は「純粋なプレーンテキスト」のみとし、HTMLタグ（<a>など）やMarkdown記号は絶対に含めないでください。

3. 本文では見出し（## や ###）を適切に使用して構造化してください。
4. 表やリストを1記事に数回用いて、リッチなコンテンツにしてください。
5. 以下の画像を、文脈に合わせて1〜2枚適切にMarkdown形式 (![alt](URL)) で挿入してください。
6. 画像や表などのhtmlを1記事に複数必ず用いてリッチコンテンツにすること。

記事の最後には、必ず記事のテーマに直結する「読者向けの簡易診断システム（3問）」のデータを、以下のJSONフォーマットで出力してください。Markdownのコードブロック(\`\`\`json)で囲むこと。

\`\`\`json
{
  "title": "（例：ITスキル・業務効率化チェックなど）",
  "questions": [
    "（はい/いいえで答えられる質問1）",
    "（はい/いいえで答えられる質問2）",
    "（はい/いいえで答えられる質問3）"
  ],
  "resultHigh": "（はいが多かった人へのフィードバック）。高いスキルを活かして独立や起業を目指すための戦略は <a href='https://あなたのBizPioneerのURL' target='_blank'>BizPioneer</a> でチェック！",
  "resultLow": "（いいえが多かった人へのフィードバック）。情報過多で少し疲れていませんか？デジタルデトックスと心を整えるヒントは <a href='https://あなたのマインドフルシャッターのURL' target='_blank'>Mindful Shutter</a> で見つけてみてください。"
}
\`\`\`

【レイアウトと表（テーブル）に関する厳格なルール】
記事内で複数の項目とその解説を列挙する場面（例：症状と解説、メリットと詳細、原因と対策など）では、箇条書き（*）を絶対に使用せず、**必ずMarkdownの「表（テーブル）」**を作成して視覚的に見やすく整理してください。
（悪い例：「* 項目: 説明 * 項目: 説明」のように1行に連続して詰め込むことは固く禁じます）
  
【利用可能な画像URLリスト】
${availableImages.map(img => `- ${img.url} (内容: ${img.alt})`).join('\n')}
  `;

  const result = await model.generateContent(prompt);
  let content = result.response.text();

  // ★修正：AIが記事全体を \`\`\`markdown で囲ってきた場合のみ、外側のラッパーを除去する
  // これにより、末尾のJSONブロックの \`\`\` が誤って消されることを完全に防ぎます。
  content = content.trim();
  const outerWrapperMatch = content.match(/^```(?:markdown|md)?\s*\n([\s\S]*)\n```$/);
  if (outerWrapperMatch) {
    content = outerWrapperMatch[1].trim();
  }

  // ★【修正箇所】タイトル部分（Frontmatter）を切り離して、広告挿入から保護する
  let frontmatter = '';
  let body = content;

  const match = content.match(/^(---[\s\S]*?---[\r\n]+)([\s\S]*)$/);
  if (match) {
    frontmatter = match[1]; // タイトルとカテゴリーの部分
    body = match[2];        // 記事の本文
  }

  // ★本文（body）にだけアフィリエイトリンクを自動挿入
  body = injectAffiliateLinks(body);

  // 切り離していたタイトル部分を安全にくっつける
  content = frontmatter + body;

  // ファイル名の生成と保存
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `post-${dateStr}-${index}.md`;
  const dirPath = path.resolve(process.cwd(), 'content/posts');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(path.join(dirPath, filename), content);
  console.log(`✅ 記事生成完了: ${filename}`);
  
  // API制限回避のための待機時間（15秒）
  await new Promise(resolve => setTimeout(resolve, 15000));
}

async function main() {
  console.log(`🚀 生成開始: ${runCount}記事を生成します...`);
  for (let i = 1; i <= runCount; i++) {
    console.log(`⏳ ${i}/${runCount} 記事目を生成中...`);
    try {
      await generateSingleArticle(i);
    } catch (error) {
      console.error(`❌ エラー発生（${i}回目）:`, error);
      // エラーが起きたらループを抜けて、そこまでの記事を保存させる
      console.log(`⚠️ API制限などのため、${i - 1}記事目までを保存して終了します。`);
      break; 
    }
  }
  console.log('🎉 すべての生成プロセスが完了しました！');
}

main();
