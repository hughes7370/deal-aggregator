To Test: ngrok http 3000

This is a full-stack web application that aggregates and analyzes business listings/deals from various sources. The project is structured as a monorepo with two main components: a Python backend and a Next.js frontend.

Backend Overview:
- Built in Python using Flask for web server functionality
- Features a modular scraper system that currently supports multiple platforms:
  - Business Exits (with detailed parsing)
  - Website Closers
  - Quiet Light
  - BizBuySell
- Uses ScraperAPI for reliable data collection with features like:
  - Premium proxy support
  - Render JavaScript capability
  - US geolocation
  - Debug HTML saving
- Implements sophisticated parsing with:
  - GPT-4 integration for intelligent content extraction
  - Platform-specific selectors and parsing rules
  - Structured financial data extraction (revenue, EBITDA, asking price)
  - Intelligent number parsing (K/M/B conversion)
  - Range handling (takes lower bound)
  - Parenthetical note handling
- Includes comprehensive services for:
  - Deal analysis with revenue and EBITDA multiples
  - Newsletter management with HTML templating
  - Dual database integration (SQLite/Supabase)
  - Test data verification and setup
  - Raw HTML debugging capabilities

Frontend Overview:
- Built with Next.js 15.1 and React 18.2.0
- Uses TypeScript for enhanced type safety
- Implements modern styling with:
  - Tailwind CSS 3.3.0
  - Custom color scheme with dark mode support
  - Inter font family integration
  - Responsive design patterns
  - Event-based layout system
  - Framer Motion for animations
- Features authentication with Clerk 6.9.3 including:
  - Sign-up/Sign-in flows with customizable redirect URLs
  - Webhook integration for user creation/updates
  - Protected routes via middleware
  - Automatic dashboard redirects for authenticated users
  - UserButton component integration
- Implements form handling with:
  - React Hook Form 7.54.1
  - Zod 3.24.1 validation
  - Supabase 2.47.8 integration
- Component structure:
  - Modular home components (Hero, Features)
  - Shared layout components (Header, Footer)
  - Form components for user preferences
  - Social media icons integration
  - Responsive navigation system

Database & Storage:
- Dual database approach:
  - SQLite for news summaries and local development
  - Supabase for production data and user management
- Implements sophisticated data models for:
  - User preferences:
    - Price ranges (min/max)
    - Industry selections
    - Geographic regions
    - Business models
    - Newsletter frequency
    - Include/exclude keywords
  - User management with Clerk integration
  - Listing details and analysis
  - Newsletter delivery tracking
- Features migration management through SQL scripts including:
  - Table alterations (20231215_alter_tables.sql)
  - Data cleaning (20231215_clean.sql)
  - Table creation (20231215_create_tables.sql)
  - Industry standardization (20231215_fix_industries.sql)
  - User table management (20240318_create_user_tables.sql)
  - User data updates (20240318_update_users.sql)

Development Tools:
- Comprehensive testing setup with:
  - Python test utilities
  - Test data generation and verification
  - Coverage reporting
  - Newsletter testing capabilities
- Development tooling including:
  - ESLint configuration with Next.js core web vitals
  - PostCSS processing
  - TypeScript configuration with strict mode
  - Debug file generation
- Environment management:
  - Multiple .env configurations (.env.local, .env.development, etc.)
  - Development/production settings
  - API key management for:
    - ScraperAPI
    - OpenAI
    - Supabase (URL and Service Role Key)
    - Clerk (including Webhook Secret)
    - Resend
  - Local SSL support
  - Ngrok for webhook testing

For new developers:
1. Start by running the development server with `npm run dev`
2. Review the authentication flow in the (auth) directory
3. Understand the preferences form implementation in components/forms
4. Study the database interactions using Supabase client
5. Review the webhook handlers in api/webhooks/clerk
6. Test with ngrok http 3000 for local webhook development
7. Explore the component structure in src/components
8. Review the constants defined in src/constants

The modular design makes it easy to:
- Add new data sources through the scraper system
- Extend user preferences and form handling
- Customize styling through Tailwind
- Implement new API routes
- Manage database schema through migrations
- Debug with comprehensive logging
- Handle authentication flows with Clerk
- Process webhooks for user management
- Add new UI components and animations
- Modify the layout system