import os
import sys
from flask import Flask, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import pytz
import logging
from dotenv import load_dotenv
import sentry_sdk

# Debug: Print current directory and Python path
print("Current working directory:", os.getcwd())
print("Python path:", sys.path)
print("Directory contents:", os.listdir())
print("Parent directory contents:", os.listdir(".."))

from src.database.supabase_db import SupabaseClient
from src.services.scheduler_service import SchedulerService

# Load environment variables
load_dotenv()

# Initialize Sentry for error tracking
if os.getenv('SENTRY_DSN'):
    sentry_sdk.init(
        dsn=os.getenv('SENTRY_DSN'),
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Initialize services
    app.scheduler_service = SchedulerService()
    app.db = SupabaseClient()
    
    def initialize_services():
        """Initialize all background services"""
        try:
            # Set up scheduler jobs
            app.scheduler_service.setup_jobs()
            
            # Start the scheduler
            app.scheduler_service.scheduler.start()
            logger.info("Scheduler service started successfully")
            
        except Exception as e:
            logger.error(f"Error initializing services: {str(e)}")
            raise
    
    @app.route('/health')
    def health_check():
        """Health check endpoint for Render"""
        try:
            # Check database connection
            app.db.client.table('listings').select('id').limit(1).execute()
            
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.now(pytz.UTC).isoformat(),
                'scheduler_running': app.scheduler_service.scheduler.running
            }), 200
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return jsonify({
                'status': 'unhealthy',
                'error': str(e)
            }), 500

    @app.route('/test/scraper', methods=['POST'])
    def test_scraper():
        """Test endpoint to trigger scraper manually"""
        try:
            app.scheduler_service.run_scraper()
            return jsonify({'status': 'success', 'message': 'Scraper triggered'}), 200
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500

    @app.route('/test/newsletter', methods=['POST'])
    def test_newsletter():
        """Test endpoint to trigger newsletter processing manually"""
        try:
            app.scheduler_service.process_newsletters()
            return jsonify({'status': 'success', 'message': 'Newsletter processing triggered'}), 200
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500

    # Initialize services
    initialize_services()
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    try:
        # Get port from environment variable or default to 5000
        port = int(os.getenv('PORT', 5000))
        
        # Start Flask app
        app.run(host='0.0.0.0', port=port, debug=False)
        
    except Exception as e:
        logger.error(f"Application startup failed: {str(e)}")
        raise 