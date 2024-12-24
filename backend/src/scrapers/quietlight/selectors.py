# Simple AgentQL query for QuietLight listings
LISTING_QUERY = """
{
    listings[] {
        title
        price
        revenue
        cash_flow
        description
        listing_link
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