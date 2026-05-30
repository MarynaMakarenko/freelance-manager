import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Freelance Manager',
  description: 'Manage your freelance business — clients, projects, time tracking, and invoices in one place.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${inter.className}`}>
      <body className="bg-[#F5F5F7] text-[#1D1D1F] h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
