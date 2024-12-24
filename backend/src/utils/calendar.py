from datetime import datetime
from typing import Dict

def generate_ics_content(event: Dict) -> str:
    """Generate ICS file content for calendar event"""
    
    # Format date and time
    try:
        date_str = event.get('date', '')
        time_str = event.get('time', '00:00')
        
        # Combine date and time
        start_datetime = datetime.strptime(f"{date_str} {time_str}", '%Y-%m-%d %H:%M')
        end_datetime = start_datetime.replace(hour=start_datetime.hour + 2)  # Default 2-hour duration
        
        # Format for ICS
        start = start_datetime.strftime('%Y%m%dT%H%M%S')
        end = end_datetime.strftime('%Y%m%dT%H%M%S')
        
        # Create unique identifier
        uid = f"{start}-{event['title'].replace(' ', '-')}@marketmonitor"
        
        # Build location string
        location = event.get('venue', '') or event.get('location', '')
        
        return f"""BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:{uid}
DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%S')}
DTSTART:{start}
DTEND:{end}
SUMMARY:{event['title']}
DESCRIPTION:{event.get('description', '')}\\n\\nEvent Link: {event.get('link', '')}
LOCATION:{location}
END:VEVENT
END:VCALENDAR"""
    except Exception as e:
        print(f"Error generating ICS content: {e}")
        return "" 