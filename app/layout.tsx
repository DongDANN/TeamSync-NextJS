import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Team Sync',
  description: 'Connect your team and stay in sync with our powerful collaboration tool.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
