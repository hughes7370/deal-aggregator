import os
import sys
from flask import Flask, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import pytz
import logging
from dotenv import load_dotenv

# Add the parent directory to Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.src.database.supabase_db import SupabaseClient
from backend.src.services.scheduler_service import SchedulerService
from backend.src.api.routes import main_bp  # Import the main blueprint

# Load environment variables
load_dotenv()

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
    
    # Register blueprints
    app.register_blueprint(main_bp)  # Register the main blueprint
    
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
        """Basic health check endpoint"""
        try:
            # Check database connection
            app.db.client.table('listings').select('id').limit(1).execute()
            
            return jsonify({
                'status': 'ok',
                'timestamp': datetime.now().isoformat()
            }), 200
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return jsonify({
                'status': 'error',
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
        # Get port from environment variable or default to 5001
        port = int(os.getenv('PORT', 5001))
        
        # Start Flask app
        app.run(host='0.0.0.0', port=port, debug=False)
        
    except Exception as e:
        logger.error(f"Application startup failed: {str(e)}")
        raise 