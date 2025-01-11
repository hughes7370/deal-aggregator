import { Suspense } from 'react'
import { DealContent } from '@/components/deal/DealContent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: { id: string }
  searchParams: Record<string, string | string[] | undefined>
}

export default async function DealPage({ params, searchParams }: Props) {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-gray-500">Loading deal details...</div>
        </div>
      }>
        <DealContent id={params.id} />
      </Suspense>
    </main>
  )
} 