// src/components/Sidebar.tsx
import Link from 'next/link';

export default function Sidebar() {
  // ※静的サイトのため、ここでは最新記事やおすすめ記事を手動またはビルド時に生成したリストとして扱います
  const popularPosts = [
    { id: 1, title: '未経験からITスキルを身につける最初の3ステップ', path: '/post-1' },
    { id: 2, title: '個人事業主におすすめのサーバー選びと設定ガイド', path: '/post-2' },
    { id: 3, title: 'ブログ自動化で時間を創出する具体的手法', path: '/post-3' },
  ];

  return (
    <aside style={{ width: '300px', flexShrink: 0, paddingLeft: '20px' }}>
      {/* 検索ボックス風 UI */}
      <div style={{ marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="記事を検索..." 
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          disabled 
        />
      </div>

      {/* よく読まれている記事 */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', borderBottom: '2px solid #0070f3', paddingBottom: '8px', marginBottom: '16px' }}>
          🔥 よく読まれている記事
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {popularPosts.map((post, i) => (
            <li key={post.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#0070f3', fontSize: '18px' }}>{i + 1}</span>
              <Link href={post.path} style={{ textDecoration: 'none', color: '#333', fontSize: '14px', lineHeight: '1.4' }}>
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* カテゴリ */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', borderBottom: '2px solid #0070f3', paddingBottom: '8px', marginBottom: '16px' }}>
          📁 カテゴリ
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['Web制作', 'ビジネス戦略', 'マーケティング', '自動化ツール', '副業'].map(tag => (
            <span key={tag} style={{ background: '#f5f5f5', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', color: '#555' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* アフィリエイト・広告枠 (プレースホルダー) */}
      <div style={{ background: '#f9f9f9', border: '1px dashed #ccc', padding: '40px 20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
        アフィリエイトバナー広告枠<br/>（300x250等）
      </div>
    </aside>
  );
}