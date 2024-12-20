# AgentQL queries for BizBuySell listings
LISTING_QUERY = """
{
    listings[] {
        title
        price
        revenue
        cash_flow
        description
        listing_link
    }
}
"""

LISTING_DETAILS_QUERY = """
{
    business_details {
        asking_price
        gross_revenue
        cash_flow
        ebitda
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
        cash_flow
        inventory
        payroll
    }
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