from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# API Configuration
SCRAPER_API_KEY = os.getenv('SCRAPER_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Debug: Print API keys (first few characters only)
if SCRAPER_API_KEY:
    print(f"SCRAPER_API_KEY loaded: {SCRAPER_API_KEY[:8]}...")
else:
    print("WARNING: SCRAPER_API_KEY not found!")
    
if OPENAI_API_KEY:
    print(f"OPENAI_API_KEY loaded: {OPENAI_API_KEY[:8]}...")
else:
    print("WARNING: OPENAI_API_KEY not found!")
    
if SUPABASE_URL and SUPABASE_KEY:
    print("Supabase credentials loaded successfully")
else:
    print("WARNING: Supabase credentials not found!")

# OpenAI Configuration
OPENAI_MODEL = "gpt-4-0125-preview"
OPENAI_MAX_TOKENS = 2000
OPENAI_TEMPERATURE = 0

# Search Configuration
DEFAULT_SEARCH_PARAMS = {
    "engine": "google_news",
    "gl": "us",
    "hl": "en",
    "tbs": "qdr:m",
    "num": 20
}

# Scraping Configuration
DEFAULT_ARTICLE_LIMIT = 20