# AgentQL queries for Empire Flippers listings
LISTING_QUERY = """
{
    listings[] {
        id
        title
        monetization
        price
        monthly_net_profit
        monthly_revenue
        monthly_multiple
        business_created
        description
        profit_trend
        revenue_trend
        traffic_trend
        listing_url
        niche
        status
    }
}
"""

LISTING_DETAILS_QUERY = """
{
    business_details {
        monetization_details
        business_model
        hours_required
        training_period
        inventory_included
        growth_opportunities
    }
    financial_details {
        yearly_revenue[]
        yearly_profit[]
        expenses_breakdown
    }
    traffic_stats {
        monthly_visitors
        traffic_sources
        top_countries
    }
    full_description
}
"""

# Pagination query
PAGINATION_QUERY = """
{
    next_page_btn
    page_numbers[] {
        number
    }
}
""" 