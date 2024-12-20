DEAL-AGGREGATOR/
├── backend/
│   ├── config/                    # Configuration files
│   │   ├── company_profile_manager.py
│   │   ├── config.py
│   │   └── search_queries.py
│   ├── src/                       # Core source code
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── listings_api.py
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── database.py
│   │   │   └── supabase_db.py
│   │   ├── scrapers/
│   │   │   ├── bizbuysell/
│   │   │   │   ├── __init__.py
│   │   │   │   └── scraper.py
│   │   │   ├── business_exits/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── listing_details_scraper.py
│   │   │   │   ├── listing_parser.py
│   │   │   │   ├── scraper.py
│   │   │   │   └── selectors.py
│   │   │   ├── quietlight/
│   │   │   │   ├── __init__.py
│   │   │   │   └── scraper.py
│   │   │   ├── website_closers/
│   │   │   │   ├── __init__.py
│   │   │   │   └── scraper.py
│   │   │   └── base_scraper.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── deal_analyzer.py
│   │       ├── listing_details_scraper.py
│   │       ├── listing_page_scraper.py
│   │       ├── listing_parser.py
│   │       └── newsletter_service.py
│   ├── runners/                   # Individual scraper runners
│   │   ├── README.md
│   │   ├── run_quietlight.py
│   │   └── run_websiteclosers.py
│   ├── templates/                 # HTML templates
│   │   └── index.html
│   ├── tests/                     # Test files
│   │   ├── __init__.py
│   │   ├── run_newsletter_test.py
│   │   ├── setup_test_data.py
│   │   └── verify_resend.py
│   ├── utils/                     # Utility functions
│   │   └── calendar.py
│   ├── Dockerfile                 # Defines container configuration for backend service
│   │                             # - Python 3.11 base image
│   │                             # - Installs dependencies
│   │                             # - Sets up environment
│   │                             # - Configures entry point
│   │
│   ├── docker-compose.yml         # Local development configuration
│   │                             # - Defines services
│   │                             # - Sets up environment variables
│   │                             # - Configures volumes
│   │
│   ├── run.py                    # Main entry point for Render deployment
│   │                             # - Initializes Flask app
│   │                             # - Sets up scheduler
│   │                             # - Configures logging
│   │                             # - Handles graceful shutdown
│   │
│   ├── scheduler.py              # Consolidated scheduling service
│   │                             # - Runs daily scraper jobs
│   │                             # - Processes newsletter sending
│   │                             # - Manages job scheduling
│   │                             # - Handles retries and errors
│   │
│   ├── health_check.py           # Health monitoring endpoints
│   │                             # - /health endpoint for Render
│   │                             # - Checks database connection
│   │                             # - Monitors scheduler status
│   │
│   ├── .env                      # Environment variables (not in git)
│   ├── main.py                   # Main scraper logic
│   ├── news_summaries.db         # Local SQLite database (not in git)
│   └── requirements.txt          # Python dependencies
│
├── frontend/                      # Next.js frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── test-db/
│   │   │   │   └── route.ts
│   │   │   ├── (auth)/
│   │   │   │   └── sign-in/
│   │   │   │       └── [[...sign-in]]/
│   │   │   │           └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── error.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── preferences/
│   │   │   │       └── page.tsx
│   │   │   └── webhooks/
│   │   │       └── clerk/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── forms/
│   │   │   └── preferences-form.tsx
│   │   ├── home/
│   │   │   ├── Features.tsx
│   │   │   └── Hero.tsx
│   │   ├── icons/
│   │   │   └── SocialIcons.tsx
│   │   ├── Footer.tsx
│   │   └── Header.tsx
│   ├── constants/
│   │   └── home.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── public/
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── supabase/
│   │   └── migrations/
│   │       ├── 20231215_alter_tables.sql
│   │       ├── 20231215_clean.sql
│   │       ├── 20231215_create_tables.sql
│   │       ├── 20231215_fix_industries.sql
│   │       ├── 20240318_create_user_tables.sql
│   │       └── 20240318_update_users.sql
│   ├── .env.local
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── middleware.ts
│   ├── next.config.js
│   ├── next-env.d.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── .gitattributes
├── render.yaml                   # Render platform configuration
│                                # - Defines services
│                                # - Configures build settings
│                                # - Sets up environment
│                                # - Manages deployment
│
└── README.md                     # Project documentation

Key Deployment Files:
- backend/Dockerfile: Container configuration for the Python backend service
- backend/run.py: Main entry point that coordinates the scraper and newsletter services
- backend/scheduler.py: Handles scheduling of scraping and newsletter jobs
- backend/health_check.py: Provides monitoring endpoints for Render
- render.yaml: Platform-specific configuration for Render deployment

The deployment architecture:
1. Render runs the backend service using the Dockerfile
2. run.py initializes both the web server and scheduler
3. scheduler.py manages periodic tasks (scraping/newsletters)
4. health_check.py ensures service availability
5. Environment variables configure the service behavior