import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

// 記事一覧を取得する関数
function getPosts() {
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  if (!fs.existsSync(postsDirectory)) return [];

  const filenames = fs.readdirSync(postsDirectory);
  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    return {
      slug: filename.replace(/\.md$/, ''),
      title: data.title || 'タイトルなし',
      date: data.date || '日付なし',
      category: data.category || '未分類',
      summary: data.summary || '',
    };
  });

  // 日付の新しい順に並び替え
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export default function Home() {
  const posts = getPosts();

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

      {/* 記事一覧 */}
      <section>
        <h3 style={{ color: '#2d3748', fontSize: '1.5rem', marginBottom: '20px' }}>最新の戦略レポート</h3>
        <div style={{ display: 'grid', gap: '20px' }}>
          {posts.length === 0 ? (
            <p style={{ color: '#718096' }}>現在、公開されているレポートはありません。</p>
          ) : (
            posts.map((post) => (
              <Link href={`/posts/${post.slug}`} key={post.slug} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                  <span style={{ display: 'inline-block', backgroundColor: '#ebf8ff', color: '#3182ce', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>
                    {post.category}
                  </span>
                  <span style={{ color: '#a0aec0', fontSize: '0.8rem', marginLeft: '15px' }}>{post.date}</span>
                  <h4 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: '1.25rem' }}>{post.title}</h4>
                  <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem', lineHeight: '1.5' }}>{post.summary}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

    </main>
  );
}