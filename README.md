# DealSight

A full-stack web application that aggregates business listings and sends personalized newsletters to subscribers based on their preferences.

## Features

- **Smart Deal Filtering**: Automatically remove spam and low-quality listings while assessing platform risk and growth potential
- **Deep Analysis**: Comprehensive evaluation of revenue stability, market position, and risk factors with comparable deal data
- **Priority Alerts**: Customizable notification timing with mobile & email delivery, including detailed PDF reports

## Tech Stack

### Backend
- Python with Flask
- GPT-4 integration for content analysis
- ScraperAPI for data collection
- Multiple platform scrapers (Business Exits, Website Closers, Quiet Light, BizBuySell)

### Frontend
- Next.js 15.1 with React 18.2.0
- TypeScript
- Tailwind CSS 3.3.0
- Clerk 6.9.3 for authentication
- React Hook Form 7.54.1 with Zod validation

### Database
- Supabase for production
- SQLite for development
- Structured migrations system

## Prerequisites
- Railway account
- GitHub repository
- Node.js and npm
- Python 3.x
- Required environment variables:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `RESEND_API_KEY`
  - `DATABASE_URL`
  - `SCRAPER_API_KEY`
  - `OPENAI_API_KEY`
  - `CLERK_SECRET_KEY`
  - `CLERK_WEBHOOK_SECRET`

## Development Setup

1. Clone the repository:

## Deployment on Railway

### Prerequisites
- Railway account
- GitHub repository
- Required environment variables:
  - SUPABASE_URL
  - SUPABASE_KEY
  - RESEND_API_KEY
  - DATABASE_URL
  - SCRAPER_API_KEY

### Automatic Deployment Steps
1. Fork/push this repository to GitHub
2. Go to [Railway.app](https://railway.app)
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose this repository
6. Railway will automatically detect the Dockerfile and deploy

### Environment Setup
1. Go to project settings in Railway
2. Add the following environment variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   RESEND_API_KEY=your_resend_api_key
   DATABASE_URL=your_database_url
   SCRAPER_API_KEY=your_scraper_api_key
   ```

### Monitoring
- View logs in Railway dashboard
- Check newsletter_logs table in database
- Monitor scheduler status in /dashboard/status

### Manual Deployment
If needed, you can deploy manually using Railway CLI: 