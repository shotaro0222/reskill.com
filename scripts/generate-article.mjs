import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY が設定されていません。");
    process.exit(1);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // プロンプトを大幅に拡張（記事＋サーベイ＋システムの統合）
  const prompt = `あなたは個人の自立とビジネス戦略を支援するプロフェッショナルです。
以下の【トピック】について、読者が「読んで終わり」にならず、実際に行動を起こせる実践的なコンテンツを作成してください。

【トピック】
AI時代の最新Webマーケティング手法と個人の役割

【出力要件】
フォーマットはMarkdown（Frontmatter付き）で出力し、以下の3つのセクションを必ず含めてください。

1. 【戦略解説（記事）】
   - 学生、会社員、独立志向の個人向けに、具体的なアクションプランを論理的に解説。
2. 【現状把握サーベイ（診断）】
   - 読者が自身の現在地を測るためのチェックリスト（5問程度）。
   - ※将来的にシステム化するため、チェックボックス形式で記載。
3. 【実践システム・ツール案】
   - このトピックを実践するために、今後Web上に実装すべき「簡単なシミュレーター」や「計算ツール」のアイデアと利用イメージ。

【出力フォーマット例】
---
title: "AI時代のWebマーケティング：個人が勝ち残るための戦略と実践ツール"
date: "${new Date().toISOString().split('T')[0]}"
category: "戦略・ツール"
summary: "Webマーケティングにおける個人のサバイバル戦略の解説と、あなたの現在地を測る診断サーベイ。"
---

## 1. 戦略解説
（ターゲット層別のアクションプラン）

## 2. 現状把握サーベイ（自己診断）
（5問程度のチェックリストと、結果に対する簡単なフィードバック）

## 3. 実践ツール案：〇〇シミュレーター
（どのようなツールがあれば読者がより実行に移しやすいか、機能要件の定義）
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const fileName = `article-${Date.now()}.md`;
    const dirPath = path.join(process.cwd(), "content", "posts");
    const filePath = path.join(dirPath, fileName);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    fs.writeFileSync(filePath, text.replace(/```markdown|```/g, "").trim());
    console.log(`✅ コンテンツを生成しました: ${fileName}`);
  } catch (error) {
    console.error("❌ 生成に失敗しました:", error);
  }
}

run();