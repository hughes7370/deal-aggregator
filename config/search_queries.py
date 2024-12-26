from typing import Dict

# Base URLs for each platform - used as fallback if database queries fail
BASE_URLS = {
    "websiteclosers": "https://www.websiteclosers.com/businesses-for-sale/",
    "bizbuysell": "https://www.bizbuysell.com/software-and-app-company-established-businesses-for-sale/?q=ZGxhPTM%3D",
    "quietlight": "https://quietlight.com/listings/",
    "empireflippers": "https://empireflippers.com/marketplace/",
    "latonas": "https://latonas.com/listings/?result_sorting_order=age_dsc&result_sorting_quantity=20&broker=any&price_range=any&revenue_range=any&unique_range=any&profit_range=any&searchTags=&location=any",
    "flippa": "https://flippa.com/search?search_template=most_relevant&sort_alias=most_recent&filter%5Bprofit_per_month%5D%5Bmin%5D=6000&filter%5Bprice%5D%5Bmin%5D=50000&filter%5Bage%5D%5Bmin%5D=12&filter%5Bsale_method%5D=classified&filter%5Bstatus%5D=open&filter%5Bproperty_type%5D=website,fba,saas,ecommerce_store,plugin_and_extension,ai_apps_and_tools,youtube,ios_app,android_app,game,crypto_app,social_media,newsletter,service_and_agency,service,other&filter%5Bsitetype%5D=all,content,blog,directory,forum-community,review,ecommerce,digital%20products,dropship,inventory-holding,shopify,saas,services,digital,physical,transact-market&filter%5Brevenue_generating%5D=T",
    "transworld": "https://tworld.com/buy-a-business/business-listing-search/?country=United+States&state=&county=&category=Internet+Related&subcategory=&listing_price_min=&listing_price_max=&down_payment_price_min=&down_payment_price_max=&seller_price_min=&seller_price_max=&formsubmit=1&s=Search&sort=-c_listing_price__c&items_per_page=10&cn-reloaded=1",
    "vikingmergers": "https://vikingmergers.com/businesses-for-sale/"
}

# Search URLs configuration
SEARCH_URLS = {
    "websiteclosers": {
        "url": BASE_URLS["websiteclosers"],
        "description": "WebsiteClosers main listing page"
    },
    "bizbuysell": {
        "url": BASE_URLS["bizbuysell"],
        "description": "BizBuySell software and app companies"
    },
    "quietlight": {
        "url": BASE_URLS["quietlight"],
        "description": "QuietLight main listing page"
    },
    "empireflippers": {
        "url": BASE_URLS["empireflippers"],
        "description": "Empire Flippers marketplace listings"
    },
    "latonas": {
        "url": BASE_URLS["latonas"],
        "description": "Latonas marketplace listings"
    },
    "flippa": {
        "url": BASE_URLS["flippa"],
        "description": "Flippa marketplace listings"
    },
    "transworld": {
        "url": BASE_URLS["transworld"],
        "description": "TransWorld Internet & Technology listings"
    },
    "vikingmergers": {
        "url": BASE_URLS["vikingmergers"],
        "description": "Viking Mergers main listing page"
    }
}

def get_queries_from_db(business_id: str = None) -> Dict[str, Dict[str, str]]:
    """
    Get search URLs from database, falling back to static URLs if needed
    
    Args:
        business_id: Optional business ID to get specific search configurations
        
    Returns:
        Dictionary of platform search URLs and their descriptions
    """
    try:
        # TODO: Implement database query logic here
        # For now, return static URLs
        return SEARCH_URLS
    except Exception as e:
        print(f"Error getting search URLs from database: {e}")
        # Fall back to base URLs if database query fails
        return {k: {"url": v, "description": f"{k} fallback URL"} for k, v in BASE_URLS.items()}