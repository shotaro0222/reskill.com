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

// 過去に生成した記事のタイトルを保持する配列
const generatedTitlesHistory = [];

async function generateSingleArticle(index) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  // 履歴が存在する場合、プロンプトに過去のタイトルリストを注入
  const historyInstruction = generatedTitlesHistory.length > 0 
    ? `\n【重要：テーマの重複回避】\n過去に以下のテーマ・タイトルの記事を既に作成しました。これらと内容、視点、タイトルが「絶対に被らないように」、全く新しい切り口で執筆してください。\n${generatedTitlesHistory.map(t => `- ${t}`).join('\n')}\n`
    : '';

  // ★ プロンプト修正：表（HTML）は許可しつつ、MarkdownによるAI臭さを消す
  const prompt = `
あなたはリスキリング特化のプロのコラムニストです。リスキリングに役立つITスキルやマーケティングスキル、マインドや経理などをメインテーマにした「読み物（エッセイ風）」を作成してください。
${historyInstruction}
【厳守事項 - 以下のルールを絶対に守ってください】
1. AIとしての返事（「承知しました」「以下の通り作成します」など）や挨拶は一切含めないでください。記事のコンテンツのみを4000字程度で出力してください。
2. 記事の先頭には必ず以下の形式でタイトルとカテゴリー（1つ）を記述してください。これがないとシステムがエラーになります。
---
title: "ここに魅力的で具体的な記事のタイトルを記載"
category: "ここに記事のカテゴリーを記載（例：マーケティング、マインドセット、SEO、資金調達など）"
---
※【超重要】titleの中身は「純粋なプレーンテキスト」のみとし、HTMLタグ（<a>など）やMarkdown記号は絶対に含めないでください。

【出力の厳密なルール（AIらしさの排除と適切な装飾）】
1. Markdown記号（#、##、-、* など）は一切使用せず、見出しや箇条書きを作らないでください。
2. 【重要】情報を比較・整理するために「表（テーブル）」が必要な場面では、必ずHTMLタグ（<table>, <tr>, <th>, <td>など）を使用して、1記事の中に数回、美しく見やすい表を作成してください。
※ Markdownの表（|---|）はレイアウトが崩れるため絶対に使用禁止です。必ずHTMLで記述してください。
3. 構造化フォーマットばかりに頼らず、自然な段落と適度な改行を使った「読み物（エッセイ・コラム風）」として全体を構成してください。
4. 「結論から言うと」「〜と言えるでしょう」「まとめ」「いかがでしたか？」といった、AI特有の定型文や不自然なまとめの段落は禁止です。
5. 現場の温度感が伝わるような、血の通った人間らしい自然な文体で、読者に語り掛けるように記述してください。
6. 以下の画像を、文脈に合わせて1〜2枚適切にMarkdown形式 (![alt](URL)) で挿入してください。画像挿入時のみMarkdownを使用しても構いません。

記事の最後には、必ず記事のテーマに直結する「読者向けの簡易診断システム（3問）」のデータを、以下のJSONフォーマットで出力してください。この部分のみMarkdownのコードブロック(\`\`\`json)で囲むこと。

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
  
【利用可能な画像URLリスト】
${availableImages.map(img => `- ${img.url} (内容: ${img.alt})`).join('\n')}
  `;

  const result = await model.generateContent(prompt);
  let content = result.response.text();

  // AIが記事全体を ```markdown で囲ってきた場合のみ、外側のラッパーを除去する
  content = content.trim();
  const outerWrapperMatch = content.match(/^```(?:markdown|md)?\s*\n([\s\S]*)\n```$/);
  if (outerWrapperMatch) {
    content = outerWrapperMatch[1].trim();
  }

  // タイトル部分（Frontmatter）を切り離して、広告挿入から保護する
  let frontmatter = '';
  let body = content;

  const match = content.match(/^(---[\s\S]*?---[\r\n]+)([\s\S]*)$/);
  if (match) {
    frontmatter = match[1]; // タイトルとカテゴリーの部分
    body = match[2];        // 記事の本文

    // frontmatterからタイトルを抽出して履歴に追加
    const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
    if (titleMatch && titleMatch[1]) {
      generatedTitlesHistory.push(titleMatch[1]);
    } else {
      generatedTitlesHistory.push(`生成済み記事${index}`);
    }
  }

  // 本文（body）にだけアフィリエイトリンクを自動挿入
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
  console.log(`✅ 記事生成完了: ${filename} (履歴件数: ${generatedTitlesHistory.length})`);
  
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
