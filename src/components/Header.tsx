// src/components/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ borderBottom: '1px solid #eaeaea', padding: '16px 0', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          {/* コードで直接描画するSVGロゴ */}
          <svg width="200" height="40" viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="#0070f3" />
            <path d="M12 20h16M20 12v16" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <text x="50" y="28" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#333">Re:Skill Blog</text>
          </svg>
        </Link>
        <nav style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: 'bold' }}>
          <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>ホーム</Link>
          <Link href="/about" style={{ color: '#666', textDecoration: 'none' }}>運営者情報</Link>
          <Link href="/contact" style={{ color: '#666', textDecoration: 'none' }}>お問い合わせ</Link>
        </nav>
      </div>
    </header>
  );
}