export interface DealStage {
  stage: string;
  count: number;
  value: number;
}

export interface DealPriority {
  priority: string;
  count: number;
}

export interface NextStep {
  type: string;
  count: number;
  next_due: string;
}

export interface BusinessType {
  type: string;
  count: number;
  percentage: number;
}

export interface RecentActivity {
  id: string;
  business_name: string;
  status: string;
  action_type: string;
  timestamp: string;
}

export interface DealMetrics {
  user_id: string;
  total_deals: number;
  recent_deals: number;
  stages: DealStage[];
  priorities: DealPriority[];
  next_steps: NextStep[];
  avg_deal_size: number;
  avg_multiple: number;
  avg_monthly_revenue: number;
  business_types: BusinessType[];
  recent_activity: RecentActivity[];
  last_updated: string;
} 