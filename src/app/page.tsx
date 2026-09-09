import Link from 'next/link';

export default function Home() {
  // ※自動生成された記事のデータ一覧を読み込む処理が後に入ります。
  // 今回は一旦、見た目をシンプルに整えるための空配列を置いています。
  const posts: any[] = []; 

  return (
    <div>
      {/* シンプルなトップメッセージ */}
      <section style={{ marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid #eaeaea' }}>
        <h1 style={{ fontSize: '24px', color: '#333', marginBottom: '16px', lineHeight: '1.4' }}>
          個人の価値を高める、<br />
          実践的リスキリング。
        </h1>
        <p style={{ color: '#666', lineHeight: '1.6', fontSize: '15px' }}>
          ITスキル、Webマーケティング、自動化ツールの活用など、個人がもっと自由に、効率的に働くための実践的なノウハウを発信しています。
        </p>
      </section>

      {/* 記事一覧セクション */}
      <section>
        <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>最新の記事</h2>
        
        {posts.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
            <p style={{ color: '#999', margin: 0 }}>現在、公開されている記事はありません。</p>
            <p style={{ color: '#ccc', fontSize: '12px', marginTop: '8px' }}>※自動生成プロセスが完了すると、ここに記事が表示されます。</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {posts.map(post => (
              <article key={post.slug} style={{ padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                  <Link href={`/posts/${post.slug}`} style={{ color: '#0070f3', textDecoration: 'none' }}>
                    {post.title}
                  </Link>
                </h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{post.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}