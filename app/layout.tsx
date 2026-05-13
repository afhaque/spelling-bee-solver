import type { Metadata } from 'next'
import { Inter, Space_Mono, Funnel_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const funnelDisplay = Funnel_Display({
  variable: '--font-funnel-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Spelling Bee Solver — AI-Powered NYT Puzzle Helper',
  description: 'Enter 7 letters with a required center letter and let AI generate all valid Spelling Bee words.',
  openGraph: {
    title: 'Spelling Bee Solver',
    description: 'AI-powered solver for the NYT Spelling Bee puzzle.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceMono.variable} ${funnelDisplay.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
