import { Suspense } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-slate-50 light:via-blue-50 light:to-indigo-50 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] dark:opacity-100 light:opacity-30 pointer-events-none transition-opacity duration-300" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.08),transparent_50%)] dark:opacity-100 light:opacity-20 pointer-events-none transition-opacity duration-300" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.08),transparent_50%)] dark:opacity-100 light:opacity-20 pointer-events-none transition-opacity duration-300" />
      <div className="relative z-10">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-slate-400 dark:text-slate-400 light:text-slate-600">Loading...</div>
          </div>
        }>
          {children}
        </Suspense>
      </div>
    </div>
  )
}

