
from flask import jsonify
from market.models.market_yfinance_analyse import FinancialDataError

def load_handle_error(app):
# Error Handlers
    @app.errorhandler(FinancialDataError)
    def handle_financial_errors(e):
        return jsonify(error=str(e)), 400
    
    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify(error="Resource not found"), 404
    
    @app.errorhandler(429)
    def handle_rate_limit(e):
        return jsonify(error="Too many requests"), 429
    