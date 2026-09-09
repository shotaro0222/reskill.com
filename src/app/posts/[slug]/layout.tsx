export const metadata = {
  title: '戦略的ビジネスサバイバル術',
  description: '独立を目指す個人やスモールビジネスのための戦略メディア',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f9f9f9' }}>
        {children}
      </body>
    </html>
  )
}