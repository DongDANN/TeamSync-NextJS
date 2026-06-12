import type { Metadata } from 'next'
import { Fira_Code } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import PWARegistrar from '@/components/ui/PWARegistrar'
import './globals.css'

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-fira-code',
})

export const metadata: Metadata = {
  title: 'Team Sync',
  description: 'Connect your team and stay in sync with our powerful collaboration tool.',
  manifest: '/manifest.json',
  other: {
    'theme-color': '#000000',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'TeamSync',
    'format-detection': 'telephone=no',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={firaCode.className}>
        <ThemeProvider>
          {children}
          <PWARegistrar />
        </ThemeProvider>
      </body>
    </html>
  )
}
