'use client'

import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <html lang="en" className="h-full">
      <head>
        <title>Freelance Manager</title>
        <meta name="description" content="Manage your freelance business — clients, projects, time tracking, and invoices in one place." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#F5F5F7] text-[#1D1D1F] h-full antialiased">
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </body>
    </html>
  )
}
