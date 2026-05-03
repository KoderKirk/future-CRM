'use client'

import { CRMProvider } from '@/context/CRMContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CRMProvider>{children}</CRMProvider>
}
