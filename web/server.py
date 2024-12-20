import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, render_template, request, send_file
from src.database.database import NewsDatabase
from datetime import datetime
from src.utils.calendar import generate_ics_content
import io
import pdfkit
import tempfile
import markdown2

app = Flask(__name__, template_folder='../templates')

# Add custom filter for number formatting
@app.template_filter('format_number')
def format_number(value):
    """Format a number with commas for thousands"""
    try:
        return "{:,}".format(int(value))
    except (ValueError, TypeError):
        return value

# Add markdown filter
@app.template_filter('markdown')
def markdown_filter(text):
    return markdown2.markdown(text, extras=['break-on-newline', 'tables', 'header-ids'])

# Add this line after creating the Flask app to debug
print("Current working directory:", os.getcwd())

@app.route('/')
def index():
    db = NewsDatabase()
    analyses = db.get_deal_analyses()
    
    if not analyses:
        return render_template('index.html', 
                             analyses=[],
                             report_index=0,
                             total_reports=0)
    
    # Format dates for display
    for analysis in analyses:
        if 'created_at' in analysis:
            created_at = datetime.strptime(analysis['created_at'], '%Y-%m-%d %H:%M:%S')
            analysis['formatted_date'] = created_at.strftime('%B %d, %Y at %I:%M %p')
    
    # Get report index from query params
    report_index = request.args.get('report', type=int, default=0)
    if report_index >= len(analyses):
        report_index = 0
    
    return render_template('index.html',
                         analyses=[analyses[report_index]],
                         report_index=report_index,
                         total_reports=len(analyses))

@app.route('/clear', methods=['POST'])
def clear():
    db = NewsDatabase()
    db.clear_database()
    return {'message': 'Database cleared successfully'}, 200

@app.route('/download-calendar/<event_type>/<int:event_index>')
def download_calendar(event_type, event_index):
    try:
        # Get events from database
        db = NewsDatabase()
        events = db.get_events()
        
        # Select correct event list
        event_list = events['this_week_events'] if event_type == 'this_week' else events['upcoming_events']
        
        if 0 <= event_index < len(event_list):
            event = event_list[event_index]
            ics_content = generate_ics_content(event)
            
            # Create in-memory file
            ics_file = io.BytesIO(ics_content.encode())
            
            # Generate filename
            safe_title = "".join(x for x in event['title'] if x.isalnum() or x in (' ', '-', '_'))
            filename = f"{safe_title[:30]}.ics"
            
            return send_file(
                ics_file,
                mimetype='text/calendar',
                as_attachment=True,
                download_name=filename
            )
            
        return "Event not found", 404
    except Exception as e:
        print(f"Error generating calendar file: {e}")
        return "Error generating calendar file", 500

@app.route('/download-pdf')
def download_pdf():
    try:
        # Get current report data
        report_index = max(0, request.args.get('report', 0, type=int))
        db = NewsDatabase()
        analyses = db.get_deal_analyses()
        events = db.get_events()
        
        if not analyses:
            return "No report data available", 404
            
        # Sort and get current report
        analyses.sort(key=lambda x: x['created_at'], reverse=True)
        visible_analyses = [analyses[report_index]]
        
        # Generate HTML for the current report
        html = render_template('index.html',
                             analyses=visible_analyses,
                             events=events,
                             report_index=report_index,
                             total_reports=len(analyses))
        
        # Create temporary file for PDF
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
            # Configure PDF options
            options = {
                'page-size': 'A4',
                'margin-top': '0.75in',
                'margin-right': '0.75in',
                'margin-bottom': '0.75in',
                'margin-left': '0.75in',
                'encoding': 'UTF-8',
                'no-outline': None
            }
            
            # Generate PDF from HTML
            pdfkit.from_string(html, tmp.name, options=options)
            
            # Generate filename based on date
            current_date = datetime.now().strftime('%Y%m%d')
            filename = f"market_report_{current_date}.pdf"
            
            return send_file(
                tmp.name,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=filename
            )
            
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return "Error generating PDF", 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
