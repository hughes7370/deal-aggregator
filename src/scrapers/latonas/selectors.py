# AgentQL queries for Latonas listings
LISTING_QUERY = """
{
    listings[] {
        title
        price
        revenue
        profit
        description
        listing_url
        location
        established_year
        employees
    }
}
"""

LISTING_DETAILS_QUERY = """
{
    business_details {
        asking_price
        gross_revenue
        net_profit
        inventory
        employees
        established_year
        location
    }
    description_text
    highlights[] {
        text
    }
    financial_info {
        revenue
        profit
        inventory
    }
}
"""

PAGINATION_QUERY = """
{
    next_page_btn
    page_numbers[] {
        number
    }
}
""" 