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

  const prompt = `あなたは「Survive & Thrive」という戦略メディアのトップコンサルタントです。
読者は、自立を目指す学生、市場価値を上げたい会社員、独立・事業展開を狙う個人です。
以下の【今日のランダムトピック】について、読者が現在地を把握し、次の一手を打つための超実践的なMarkdown記事を作成してください。

【今日のランダムトピック】
「AIツールを活用した個人の生産性革命と、余剰時間のマネタイズ戦略」

【出力要件】
必ず以下のFrontmatterを含め、指定の構成でMarkdownを出力してください。

---
title: "[トピックを一言で表す魅力的なタイトル]"
date: "${new Date().toISOString().split('T')[0]}"
category: "事業戦略 / スキル構築 / キャリア のいずれか"
summary: "[記事の要約を120文字程度で]"
---

## 1. 戦略的インサイト（現状分析）
（トピックがなぜ重要なのか、社会背景と個人の危機感を論理的に解説）

## 2. フェーズ別サバイバル・アクション
（以下の3ターゲット向けに、明日から実行できる具体的な行動計画）
- **Phase 1: 武器の発見（学生・若手向け）**
- **Phase 2: 戦場での立ち回り（会社員・中堅向け）**
- **Phase 3: 独立と事業化（個人事業主・独立志向向け）**

## 3. 現在地把握サーベイ
（読者が自身の状態を測るための5つのチェックリスト）
- [ ] 設問1
- [ ] 設問2
- [ ] 設問3
- [ ] 設問4
- [ ] 設問5
> **診断結果:** 〇個以上チェックがついた方は、〇〇のフェーズにいます。まずは〇〇から始めましょう。

## 4. 実践のためのシステム・ツール案
（この課題を解決するために、将来的に当サイトに実装予定のシミュレーターや計算ツールの要件定義）
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const fileName = `article-${Date.now()}.md`;
    const dirPath = path.join(process.cwd(), "content", "posts");
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    fs.writeFileSync(path.join(dirPath, fileName), text.replace(/```markdown|```/g, "").trim());
    console.log(`✅ 記事を生成しました: ${fileName}`);
  } catch (error) {
    console.error("❌ 記事の生成に失敗しました:", error);
  }
}

run();