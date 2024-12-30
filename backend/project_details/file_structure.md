# Backend Directory Structure

```
backend/
├── project_details/       # Project documentation and details
├── tests/                # Test files and test configurations
├── src/                  # Main source code directory
│   ├── api/             # API endpoints and routes
│   ├── constants/       # Constant values and configurations
│   ├── database/        # Database models and connections
│   ├── lib/            # Common libraries and shared code
│   ├── scrapers/       # Web scrapers for different platforms
│   ├── services/       # Business logic and services
│   ├── tests/          # Unit tests for source code
│   └── utils/          # Utility functions and helpers
├── migrations/          # Database migration files
├── logs/               # Application logs
├── requirements.txt    # Python dependencies
├── render.yaml         # Render deployment configuration
├── run.py             # Application runner script
├── main.py            # Main application entry point
└── .env               # Environment variables (not tracked in git)
```

## Key Components

### Source Code (`src/`)
- `api/`: REST API endpoints and route handlers
- `constants/`: Application-wide constants and configuration values
- `database/`: Database models, schemas, and connection management
- `lib/`: Shared libraries and common functionality
- `scrapers/`: Web scraping modules for different marketplace platforms
- `services/`: Core business logic and service layer
- `utils/`: Helper functions and utility modules

### Configuration and Setup
- `requirements.txt`: Lists all Python package dependencies
- `render.yaml`: Configuration for Render platform deployment
- `.env`: Environment variables for local development
- `main.py`: Application initialization and setup
- `run.py`: Script for running the application

### Development Support
- `migrations/`: Database schema version control
- `logs/`: Application runtime logs
- `tests/`: Integration and end-to-end tests
- `project_details/`: Project documentation and specifications
