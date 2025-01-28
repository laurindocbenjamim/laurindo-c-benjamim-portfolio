import re
from sqlalchemy import text

def sanitize_sql(input_str):
    """Sanitize input for raw SQL queries"""
    return re.sub(r'[;\\\'"()]', '', input_str)

def safe_query(query):
    """Execute safe SQL query using ORM"""
    return text(sanitize_sql(query))