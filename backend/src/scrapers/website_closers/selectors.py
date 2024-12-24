# Selectors for listing overview page
SELECTORS = {
    'listing_container': 'post_content',
    'title': 'post_title',
    'price': 'asking_price',
    'description': 'the_content'
}

# Selectors for detailed listing pages
PAGE_SELECTORS = {
    'metrics_section': 'botoom',
    'asking_price': 'asking_price',
    'cash_flow': 'cash_flow',
    'revenue': 'revenue',
    'content': 'the_content',
    'patterns': {
        'years_in_business': r'(\d+)\s*(?:year|yr)s?(?:\s+in\s+business)?',
        'employees': r'(\d+)\s*(?:employee|staff|team\s*member)s?',
        'location': r'located\s+in\s+([^\.]+)',
        'reason_for_sale': r'reason\s+for\s+sale[:\s]+([^\.]+)',
        'growth_opportunities': r'growth\s+opportunities?[:\s]+([^\.]+)'
    }
} 