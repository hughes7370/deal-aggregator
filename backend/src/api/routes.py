from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__, url_prefix='/api/v1')

@main_bp.route('/')
def index():
    return jsonify({
        'status': 'running',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health',
            'scraper': '/test/scraper',
            'newsletter': '/test/newsletter'
        }
    }) 