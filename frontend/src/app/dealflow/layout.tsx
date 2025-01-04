import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Deal Flow',
  description: 'Browse and filter business listings',
}

export default function DealFlowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 