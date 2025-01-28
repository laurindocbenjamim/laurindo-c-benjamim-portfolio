# tests/test_app.py
import pytest
from app import create_app, Config
from unittest.mock import patch

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@patch('yfinance.Ticker')
def test_valid_stock_request(mock_ticker, client):
    mock_ticker.return_value.history.return_value = [100, 105, 110]
    mock_ticker.return_value.info = {'currentPrice': 150}
    
    response = client.get('/api/v1/stocks/AAPL?period=1d')
    assert response.status_code == 200
    assert 'current_price' in response.json

def test_invalid_asset_type(client):
    response = client.get('/api/v1/invalid/BTC-USD')
    assert response.status_code == 404

def test_invalid_symbol(client):
    response = client.get('/api/v1/stocks/INVALID?period=1d')
    assert response.status_code == 400

def test_invalid_period(client):
    response = client.get('/api/v1/stocks/AAPL?period=10y')
    assert response.status_code == 400

@patch('app.get_financial_data')
def test_rate_limiting(mock_data, client):
    mock_data.return_value = {}
    for _ in range(10):
        client.get('/api/v1/stocks/AAPL')
    response = client.get('/api/v1/stocks/AAPL')
    assert response.status_code == 429