

import logging
import cachetools
from typing import Dict, Any
from datetime import datetime
import yfinance as yf
from flask import current_app

cache = cachetools.TTLCache(maxsize=1000, ttl=current_app.config['CACHE_TTL'])

class InvalidPeriodError(Exception):
    pass

class SymbolNotFoundError(Exception):
    pass

class FinancialDataError(Exception):
    pass


def validate_period(period: str) -> None:
    """Validate requested time period"""
    if period not in current_app.config['ALLOWED_PERIODS']:
        raise InvalidPeriodError(f"Invalid period: {period}")

def validate_symbol(symbol: str, asset_type: str) -> None:
    """Validate requested symbol"""
    if symbol not in current_app.config['VALID_SYMBOLS'][asset_type]:
        raise SymbolNotFoundError(f"Invalid {asset_type} symbol: {symbol}")

def get_financial_data(symbol: str, period: str, asset_type: str) -> Dict[str, Any]:
    """
    Fetch and cache financial data from Yahoo Finance
    Args:
        symbol: Asset symbol (e.g., AAPL)
        period: Time period (e.g., 1d, 1mo)
        asset_type: Type of asset (stocks/crypto)
    Returns:
        Dict containing formatted financial data
    """
    cache_key = f"{asset_type}-{symbol}-{period}"
    if cache_key in cache:
        return cache[cache_key]
    
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)
        info = ticker.info
        
        data = {
            'symbol': symbol,
            'current_price': round(info.get('currentPrice', 0), 2),
            'change_pct': round(info.get('regularMarketChangePercent', 0), 2),
            'historical': [
                {'date': date.strftime('%Y-%m-%d'), 'price': round(price, 2)}
                for date, price in zip(hist.index, hist['Close'])
            ],
            'meta': {
                'currency': info.get('currency', 'USD'),
                'asset_type': asset_type,
                'last_updated': datetime.utcnow().isoformat()
            }
        }
        
        cache[cache_key] = data
        return data
    
    except Exception as e:
        logging.error(f"Error fetching data for {symbol}: {str(e)}")
        raise FinancialDataError("Failed to fetch financial data")
    

def validate_period(period: str) -> None:
    """Validate requested time period"""
    if period not in current_app.config['ALLOWED_PERIODS']:
        raise InvalidPeriodError(f"Invalid period: {period}")
    
def validate_symbol(symbol: str, asset_type: str) -> None:
    """Validate requested symbol"""
    if symbol not in current_app.config['VALID_SYMBOLS'][asset_type]:
        raise SymbolNotFoundError(f"Invalid {asset_type} symbol: {symbol}")