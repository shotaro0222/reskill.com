import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// 事前に生成する記事一覧を取得
export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  // フォルダがない場合は空配列を返す
  if (!fs.existsSync(postsDirectory)) return [];
  
  const filenames = fs.readdirSync(postsDirectory);
  return filenames.map((filename) => ({
    slug: filename.replace(/\.md$/, ''),
  }));
}

// 記事の詳細画面
export default async function Post({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), 'content/posts', `${params.slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  // MarkdownをHTMLに変換
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{data.title}</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        公開日: {data.date} | カテゴリ: {data.category}
      </p>
      <div 
        style={{ lineHeight: '1.8' }}
        dangerouslySetInnerHTML={{ __html: contentHtml }} 
      />
    </main>
  );
}