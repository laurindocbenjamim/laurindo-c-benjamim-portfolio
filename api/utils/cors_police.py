

TRUESTED_DOMAINS=[
    "http://localhost:52330",
    "http://localhost:5000",
    "https:www.d-tuning.com"
]
#
def allowed_domains_to_api_route():
    """
    
    """
    return [TRUESTED_DOMAINS[0],TRUESTED_DOMAINS[1],TRUESTED_DOMAINS[2]]

#
def allowed_domains_to_upload_route():
    """
    
    """
    return [TRUESTED_DOMAINS[0],TRUESTED_DOMAINS[1],TRUESTED_DOMAINS[2]]

#
def allowed_domains_to_files_route():
    """
    
    """
    return [TRUESTED_DOMAINS[0],TRUESTED_DOMAINS[1],TRUESTED_DOMAINS[2]]