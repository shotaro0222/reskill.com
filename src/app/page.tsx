import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// 記事データを読み込んでHTMLに変換する処理
async function getPosts() {
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  if (!fs.existsSync(postsDirectory)) return [];

  const filenames = fs.readdirSync(postsDirectory);
  
  // 各ファイルを処理
  const postsPromises = filenames.map(async (filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // MarkdownをHTMLに変換
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    return {
      id: filename.replace(/\.md$/, ''),
      title: data.title || 'タイトルなし',
      date: data.date || '日付なし',
      category: data.category || '未分類',
      summary: data.summary || '',
      contentHtml, // 変換済みのHTMLを含める
    };
  });

  const posts = await Promise.all(postsPromises);
  // 日付の新しい順に並び替え
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      
      {/* サイトコンセプト */}
      <section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <h2 style={{ color: '#2d3748', borderBottom: '2px solid #3182ce', paddingBottom: '10px' }}>Your Strategy, Your Survival.</h2>
        <p style={{ color: '#4a5568', lineHeight: '1.8' }}>
          AIの台頭、終身雇用の崩壊。ルールが変わる現代において、組織に依存せず個人の価値を最大化するための戦略が必要です。<br/>
          当メディアでは、学生のキャリア構築から、会社員としての社内ポジション確立、そして独立・事業立ち上げまで、各フェーズにおける実践的なサバイバル術とツールを提供します。
        </p>
      </section>

      {/* 記事一覧（全文表示型） */}
      <section>
        <h3 style={{ color: '#2d3748', fontSize: '1.5rem', marginBottom: '20px' }}>最新の戦略レポート</h3>
        <div style={{ display: 'grid', gap: '40px' }}>
          {posts.length === 0 ? (
            <p style={{ color: '#718096' }}>現在、公開されているレポートはありません。</p>
          ) : (
            posts.map((post) => (
              <article key={post.id} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ display: 'inline-block', backgroundColor: '#ebf8ff', color: '#3182ce', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>
                    {post.category}
                  </span>
                  <span style={{ color: '#a0aec0', fontSize: '0.8rem', marginLeft: '15px' }}>{post.date}</span>
                </div>
                
                <h4 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.75rem', lineHeight: '1.4' }}>{post.title}</h4>
                
                <div 
                  className="markdown-body"
                  style={{ color: '#4a5568', lineHeight: '1.8' }}
                  dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
                />
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}