export const metadata = {
  title: 'Survive & Thrive | 戦略的ビジネスサバイバル術',
  description: '学生から独立志向の個人まで。変化の激しい時代を生き抜き、個人の価値を最大化するための戦略メディア。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f4f7f6', fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif' }}>
        <header style={{ backgroundColor: '#1a202c', padding: '20px 0', color: 'white', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', letterSpacing: '2px' }}>Survive & Thrive</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#a0aec0' }}>個人のための戦略的ビジネスサバイバル術</p>
        </header>
        {children}
        <footer style={{ backgroundColor: '#1a202c', color: '#a0aec0', textAlign: 'center', padding: '20px 0', marginTop: '60px', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} Survive & Thrive. All rights reserved.
        </footer>
      </body>
    </html>
  )
}