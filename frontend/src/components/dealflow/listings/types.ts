import { BusinessType } from '../filters/BusinessTypeFilter'
import { Source } from '../filters/SourceFilter'

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  monthlyRevenue: number
  monthlyProfit: number
  multiple: number
  ageYears: number
  businessType: BusinessType
  source: Source
  daysListed: number
  hoursListed: number
  growthRate?: number
  teamSize?: number
  location?: string
  profitMargin?: number
  originalListingUrl?: string
  created_at: string
}

export type ViewMode = 'list' | 'grid' 