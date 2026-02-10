import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mobile Arena Targeting Test',
  description: 'Test mobile touch targeting and interaction',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, touchAction: 'none' }}>{children}</body>
    </html>
  )
}
