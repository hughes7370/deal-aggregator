# Deal Aggregator Backend

A robust Python backend service that aggregates business listings from multiple online marketplaces. The system scrapes, processes, and stores business listings from various platforms including Acquire, BizBuySell, QuietLight, Empire Flippers, Latonas, and more.

## Features

- Multi-platform scraping support for major business marketplaces
- Automated data extraction and normalization
- Duplicate listing detection
- Structured data storage in Supabase
- RESTful API endpoints for listing access
- Scheduled scraping jobs
- Detailed logging and error handling

## Supported Platforms

- Acquire
- BizBuySell
- Business Exits
- Empire Flippers
- Flippa
- Latonas
- QuietLight
- Sunbelt
- Transworld
- Viking Mergers
- Website Closers

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
Create a `.env` file with the following variables:
```
SCRAPER_API_KEY=your_scraper_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

3. Initialize the database:
```bash
python run.py init-db
```

## Usage

### Running the Scraper

```bash
python run.py scrape
```

This will:
- Fetch new listings from all supported platforms
- Process and normalize the data
- Store unique listings in the database
- Skip duplicate or invalid listings

### API Server

```bash
python main.py
```

Starts the FastAPI server providing access to the aggregated listings.

## Architecture

The backend follows a modular architecture:

- `src/scrapers/`: Individual scraper implementations for each platform
- `src/api/`: REST API endpoints and handlers
- `src/database/`: Database models and connection management
- `src/services/`: Business logic and service layer
- `src/utils/`: Helper functions and utilities

## Data Processing

Each listing is processed to extract:
- Basic information (title, description, URL)
- Financial details (revenue, EBITDA, asking price)
- Business metrics (age, employees, location)
- Additional metadata (industry, business model)

## Error Handling

The system includes:
- Automatic retry mechanisms for failed requests
- Comprehensive error logging
- Skip logic for invalid or incomplete listings
- Rate limiting and request throttling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[License Type] - See LICENSE file for details
