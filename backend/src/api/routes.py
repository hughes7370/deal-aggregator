from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return jsonify({
        'status': 'running',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health',
            'status': '/dashboard/status'
        }
    }) 