import fs from 'fs';
import path from 'path';
import Link from 'next/link';

// ① Xserver(静的ホスティング)用に、どのURL(slug)が存在するかをビルド時にNext.jsに教える必須の関数
export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  if (!fs.existsSync(postsDirectory)) return [];
  
  const filenames = fs.readdirSync(postsDirectory);
  return filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => ({
      slug: filename.replace('.md', ''), // 「post-XXXX」の部分だけをURLとして登録
    }));
}

// ② パッケージを使わずに、MarkdownをブログらしいHTMLに変換する簡易エンジン
function parseMarkdownToHTML(markdown: string) {
  // フロントマター（---から---まで）を削除
  let html = markdown.replace(/---[\s\S]*?---/, '');
  
  // 見出しや太字、リンクをHTMLタグに変換してデザインを整える
  html = html
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.2rem; margin-top: 2.5rem; margin-bottom: 1rem; color: #333;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5rem; border-bottom: 2px solid #0070f3; padding-bottom: 8px; margin-top: 3rem; margin-bottom: 1rem; color: #111;">$1</h2>')
    .replace(/^# (.*$)/gim, '') // タイトル(H1)はページ上部で別で出すため非表示
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0070f3; text-decoration: underline;">$1</a>');

  // 段落の処理（改行を <br> に変換）
  html = html.replace(/\n\n/g, '<br /><br />');

  return html;
}

// ③ 実際の画面表示部分
export default async function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'content/posts', `${slug}.md`);
  
  // 念のためファイルが存在しない場合のエラー回避
  if (!fs.existsSync(filePath)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>記事が見つかりません。</p>
        <Link href="/">トップページへ戻る</Link>
      </div>
    );
  }

  // ファイルの中身を読み込む
  const fileContents = fs.readFileSync(filePath, 'utf8');
  
  // タイトルを自動抽出
  let title = '無題の記事';
  const titleMatch = fileContents.match(/title:\s*["']?([^"'\n]+)["']?/);
  if (titleMatch) {
    title = titleMatch[1];
  } else {
    const h1Match = fileContents.match(/^#\s+(.*)/m);
    if (h1Match) title = h1Match[1];
  }

  // 本文をHTMLに変換（アフィリエイトなどのタグもここで生かされます）
  const contentHtml = parseMarkdownToHTML(fileContents);

  return (
    <article style={{ padding: '10px 20px', lineHeight: '1.8', color: '#444' }}>
      <div style={{ marginBottom: '30px' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
          ← トップページへ戻る
        </Link>
      </div>

      <h1 style={{ fontSize: '28px', color: '#111', marginBottom: '40px', lineHeight: '1.4' }}>
        {title}
      </h1>

      {/* dangerouslySetInnerHTML を使うことで、スクリプトが埋め込んだアフィリエイトHTMLをそのまま表示できる */}
      <div 
        style={{ fontSize: '16px' }}
        dangerouslySetInnerHTML={{ __html: contentHtml }} 
      />
    </article>
  );
}