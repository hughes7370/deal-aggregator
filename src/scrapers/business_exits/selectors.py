# Selectors for listing overview page
SELECTORS = {
    'listing_container': 'listing-item',
    'title': ['listing-title', 'title', 'heading'],
    'price': ['price', 'asking-price', 'listing-price'],
    'revenue': ['revenue', 'annual-revenue'],
    'income': ['cash-flow', 'ebitda', 'profit'],
    'description': ['description', 'listing-description', 'summary']
}

# Selectors for detailed listing pages
PAGE_SELECTORS = {
    'financial_section': ['financial-details', 'listing-financials', 'metrics'],
    'asking_price': ['Price:', 'Asking Price:', 'Listing Price:'],
    'revenue': ['Revenue:', 'Annual Revenue:', 'Yearly Revenue:'],
    'income': ['Cash Flow:', 'EBITDA:', 'Annual Profit:'],
    'content': ['listing-content', 'description', 'details'],
    'patterns': {
        'years_in_business': r'(\d+)\s*(?:year|yr)s?(?:\s+in\s+business)?',
        'employees': r'(\d+)\s*(?:employee|staff|team\s*member)s?',
        'location': r'located\s+in\s+([^\.]+)',
        'reason_for_sale': r'reason\s+for\s+sale[:\s]+([^\.]+)',
        'growth_opportunities': r'growth\s+opportunities?[:\s]+([^\.]+)'
    }
} 