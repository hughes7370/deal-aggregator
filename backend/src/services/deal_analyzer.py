from typing import Dict, List
import json
from datetime import datetime
from backend.src.database.supabase_db import SupabaseClient

def analyze_listings(listings: Dict[str, List[Dict]]) -> None:
    """
    Analyze new listings and store results
    """
    try:
        supabase = SupabaseClient()
        
        # Process listings from each source
        for source, source_listings in listings.items():
            print(f"\nAnalyzing {len(source_listings)} listings from {source}")
            
            for listing in source_listings:
                try:
                    # Basic metrics
                    metrics = {
                        'asking_price': listing.get('asking_price', 0),
                        'revenue': listing.get('revenue', 0),
                        'ebitda': listing.get('ebitda', 0)
                    }
                    
                    # Calculate multiples if possible
                    if metrics['revenue'] > 0:
                        metrics['revenue_multiple'] = metrics['asking_price'] / metrics['revenue']
                    if metrics['ebitda'] > 0:
                        metrics['ebitda_multiple'] = metrics['asking_price'] / metrics['ebitda']
                    
                    # Add analysis timestamp
                    metrics['analyzed_at'] = datetime.now().isoformat()
                    
                    # Store analysis results with the listing
                    listing['analysis'] = metrics
                    
                    print(f"\nAnalyzed listing: {listing.get('title', 'Untitled')}")
                    print(f"Metrics: {json.dumps(metrics, indent=2)}")
                    
                except Exception as e:
                    print(f"Error analyzing listing: {e}")
                    continue
                    
    except Exception as e:
        print(f"Error in listing analysis: {e}")