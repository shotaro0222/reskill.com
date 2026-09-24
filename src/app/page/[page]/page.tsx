import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts, getTotalPages, paginatePosts } from '@/lib/posts';
import Pagination from '@/components/Pagination';

// 静的エクスポート対象にする
export const dynamic = 'force-static';

// ★追加：記事一覧のページネーション用ルート（/page/2, /page/3, ...）
// 1ページ目はトップページ（/）が担当するので、ここでは2ページ目以降だけ生成する
export async function generateStaticParams() {
  const posts = await getPosts();
  const totalPages = getTotalPages(posts.length);

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export default async function PostsPage({ params }: { params: { page: string } }) {
  const pageNumber = Number(params.page);
  const posts = await getPosts();
  const totalPages = getTotalPages(posts.length);

  // 不正なページ番号（数字以外・範囲外）は404にする
  if (!Number.isInteger(pageNumber) || pageNumber < 2 || pageNumber > totalPages) {
    notFound();
  }

  const pagePosts = paginatePosts(posts, pageNumber);

  return (
    <div>
      <section style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eaeaea' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none', fontSize: '14px' }}>
          ← トップへ戻る
        </Link>
      </section>

      <section>
        <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>
          記事一覧（{pageNumber}ページ目） ({posts.length}件)
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {pagePosts.map(post => (
            <article key={post.slug} style={{ padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px', background: '#fff' }}>
              <span style={{ display: 'inline-block', backgroundColor: '#e6f2ff', color: '#0070f3', fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '16px', marginBottom: '10px' }}>
                {post.category}
              </span>

              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                <Link href={`/posts/${post.slug}`} style={{ color: '#0070f3', textDecoration: 'none' }}>
                  {post.title}
                </Link>
              </h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>{post.excerpt}</p>
            </article>
          ))}
        </div>

        <Pagination currentPage={pageNumber} totalPages={totalPages} accentColor="#0070f3" />
      </section>
    </div>
  );
}
