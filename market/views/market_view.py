
import logging
from flask import Blueprint,jsonify, current_app, request
from market.config import token_blocklist, db, limiter
from market.models.market_yfinance_analyse import (validate_period, 
                                                   validate_symbol, 
                                                   FinancialDataError, 
                                                   get_financial_data
                                                   )

market = Blueprint("market", __name__)
# API Routes
@market.route('/api/v1/<asset_type>/<symbol>', methods=['GET'])
@limiter.limit(current_app.config['RATE_LIMIT'])
def get_asset_data(symbol: str, asset_type: str):
    """
        Endpoint to fetch financial data for a specific asset
        ---
        parameters:
          - name: symbol
            in: path
            type: string
            required: true
          - name: asset_type
            in: path
            type: string
            enum: [stocks, crypto]
            required: true
          - name: period
            in: query
            type: string
            enum: [1d, 5d, 1mo, 6mo, 1y, ytd]
            default: 1d
        responses:
          200:
            description: Financial data response
          400:
            description: Invalid request parameters
          429:
            description: Rate limit exceeded
    """
    period = request.args.get('period', '1d')
        
    try:
        validate_period(period)
        validate_symbol(symbol, asset_type)
        data = get_financial_data(symbol, period, asset_type)
        return jsonify(data)
        
    except FinancialDataError as e:
        logging.warning(f"Bad request: {str(e)}")
        raise