import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// APIキーを読み込む
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  // ※エラーを防ぐため、APIキーが設定されていない場合は処理を止める
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY が設定されていません。");
    process.exit(1);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `あなたは優れたビジネス戦略コンサルタントです。
以下の【トピック】について、個人のビジネスサバイバルという視点から解説記事を作成してください。

【トピック】
AI時代の最新Webマーケティング手法と個人の役割

【出力要件】
1. フォーマットはMarkdown（Frontmatter付き）で出力してください。
2. 以下の3つのターゲット層に向けた具体的なアクションプランを必ず含めてください。
   - 【学生向け（高校生・大学生）】今すぐ触れるべきツールと身につけるべき思考法
   - 【会社員・新卒向け】組織内でこの知識を活かして独自のポジションを築く方法
   - 【独立・事業転換を目指す個人向け】この流れを利用したスモールビジネスの事業機会
3. 文章は実践的かつ論理的に記載してください。

【出力フォーマット例】
---
title: "AI時代のWebマーケティングで個人が勝ち残るための戦略"
date: "${new Date().toISOString().split('T')[0]}"
category: "マーケティング戦略"
summary: "AI化が進むWebマーケティング領域において、学生・会社員・独立志向の個人がそれぞれ取るべきサバイバル戦略を解説。"
---

（ここに本文を出力）`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // content/posts ディレクトリに保存
    const fileName = `article-${Date.now()}.md`;
    const dirPath = path.join(process.cwd(), "content", "posts");
    const filePath = path.join(dirPath, fileName);
    
    // フォルダが無ければ作成
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Markdownの装飾バッククォートがあれば除去して保存
    fs.writeFileSync(filePath, text.replace(/```markdown|```/g, "").trim());
    console.log(`✅ 記事を生成しました: ${fileName}`);
  } catch (error) {
    console.error("❌ 記事の生成に失敗しました:", error);
  }
}

run();