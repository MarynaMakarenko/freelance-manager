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
      </head>
      <body className="bg-slate-50 text-slate-900 h-full">
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </body>
    </html>
  )
}
