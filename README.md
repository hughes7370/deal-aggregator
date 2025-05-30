# Open Source MicroSaaS Deal Sourcing Platform

A full-stack web application that aggregates business listings and sends personalized newsletters to subscribers based on their preferences.

## Features

- **Smart Deal Filtering**: Automatically remove spam and low-quality listings while assessing platform risk and growth potential
- **Deep Analysis**: Comprehensive evaluation of revenue stability, market position, and risk factors with comparable deal data
- **Priority Alerts**: Customizable notification timing with mobile & email delivery, including detailed PDF reports

## Project Structure

```
.
├── backend/           # Backend service implementation
│   ├── run.py        # Main backend server
│   └── src/          # Backend source code
├── src/              # Main application source
│   ├── app/          # Next.js pages and routes
│   ├── components/   # Reusable React components
│   ├── scrapers/     # Web scraping implementations
│   ├── services/     # Business logic
│   └── api/          # API route handlers
└── config/           # Configuration files
```

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

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Set up Python virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install Python dependencies
   pip install -r requirements.txt
   pip install -r backend/requirements.txt
   ```
3. Set up environment variables in `.env` and `backend/.env`
4. Run the development servers:
   ```bash
   # Start the frontend
   npm run dev
   
   # In a separate terminal, start the backend
   cd backend
   python run.py
   ```

## Monitoring
- Check newsletter_logs table in database
- Monitor scheduler status in /dashboard/status
- View application logs in backend/logs directory

## Newsletter System

The application includes a comprehensive newsletter system that sends personalized deal updates to users based on their preferences. The system includes:

### Newsletter Frequencies
Users can choose from four notification frequencies:
- **Instantly**: Receive notifications as soon as new matching listings are added
- **Daily**: Receive a digest of new listings from the past 24 hours
- **Weekly**: Receive a weekly summary of new listings
- **Monthly**: Receive a monthly digest of new listings

### Content Filtering
The system ensures relevant content by:
- Filtering listings based on user's price range preferences
- Matching industry preferences
- Preventing duplicate listings
- Only showing listings added since the last notification
- Limiting to 10 most recent listings per email
- Ordering listings by newest first

### Scheduling Logic
- **Instant**: Triggered immediately when new matching listings are added
- **Daily**: Sent at 9 AM UTC if last sent > 20 hours ago
- **Weekly**: Sent at 9 AM UTC if last sent > 6 days ago
- **Monthly**: Sent at 9 AM UTC if last sent > 27 days ago

### Logging and Monitoring
All newsletter activities are tracked in the `newsletter_logs` table with:
- Delivery status (pending, sent, failed, skipped)
- Scheduled delivery time
- Actual send time
- Error messages (if any)
- User and analysis references

### Testing
The newsletter system includes comprehensive tests covering:
- Log creation
- Scheduled delivery
- Error handling
- Scheduler integration

To run the newsletter tests:
```bash
pytest backend/tests/test_newsletter_logs.py -v
```

### Environment Variables
The newsletter system requires:
```bash
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_from_email
```

### Monitoring
Monitor the newsletter system through:
- `newsletter_logs` table in Supabase
- Application logs in `backend/logs`
- Dashboard status at `/dashboard/status`
