import yfinance as yf
from datetime import datetime


def fetch_stock_prices(ticker: str, period: str = "1mo"):
    """
    Fetch real-time & historical stock prices using yfinance.
    
    :param ticker: The stock ticker symbol (e.g., 'AAPL' for Apple).
    :param period: The time span for historical data (e.g., '1d', '5d', '1mo', '6mo', '1y', '5y', 'max').
    :return: Pandas DataFrame containing stock price data.
    """
    try:
        stock = yf.Ticker(ticker)
        data = stock.history(period=period)
        return data
    except Exception as e:
        print(f"Error fetching stock data: {e}")
        return None

def fetch_market_indices(index_ticker: str, period: str = "1mo"):
    """
    Fetch market indices (e.g., S&P 500, NASDAQ) using yfinance.
    
    :param index_ticker: The market index ticker symbol (e.g., '^GSPC' for S&P 500, '^IXIC' for NASDAQ).
    :param period: The time span for historical data (e.g., '1d', '5d', '1mo', '6mo', '1y', '5y', 'max').
    :return: Pandas DataFrame containing market index data.
    """
    try:
        index = yf.Ticker(index_ticker)
        data = index.history(period=period)
        return data
    except Exception as e:
        print(f"Error fetching market index data: {e}")
        return None
    
def fetch_forex_rates(currency_pair: str, period: str = "1mo"):
    """
    Retrieve forex (foreign exchange) rates using yfinance.
    
    :param currency_pair: The forex ticker symbol (e.g., 'EURUSD=X' for Euro to US Dollar).
    :param period: The time span for historical data (e.g., '1d', '5d', '1mo', '6mo', '1y', '5y', 'max').
    :return: Pandas DataFrame containing forex exchange rate data.
    """
    try:
        forex = yf.Ticker(currency_pair)
        data = forex.history(period=period)
        return data
    except Exception as e:
        print(f"Error fetching forex rates: {e}")
        return None
    
def fetch_company_financials(ticker: str):
    """
    Get company financials (income statements, balance sheets, cash flow) using yfinance.
    
    :param ticker: The stock ticker symbol (e.g., 'AAPL' for Apple).
    :return: Dictionary containing income statement, balance sheet, and cash flow data.
    """
    try:
        stock = yf.Ticker(ticker)
        financials = {
            "income_statement": stock.financials,
            "balance_sheet": stock.balance_sheet,
            "cash_flow": stock.cashflow
        }
        return financials
    except Exception as e:
        print(f"Error fetching company financials: {e}")
        return None
    
def fetch_analyst_ratings(ticker: str):
    """
    Access analyst ratings and stock recommendations using yfinance.
    
    :param ticker: The stock ticker symbol (e.g., 'MSFT' for Microsoft).
    :return: Pandas DataFrame containing analyst ratings and recommendations.
    """
    try:
        stock = yf.Ticker(ticker)
        ratings = stock.recommendations
        return ratings
    except Exception as e:
        print(f"Error fetching analyst ratings: {e}")
        return None
    
    
def fetch_commodity_prices(commodity_ticker: str, period: str = "1mo"):
    """
    Get real-time and historical commodity prices using yfinance.
    
    :param commodity_ticker: The commodity ticker symbol (e.g., 'GC=F' for Gold, 'CL=F' for Crude Oil, 'SI=F' for Silver).
    :param period: The time span for historical data (e.g., '1d', '5d', '1mo', '6mo', '1y', '5y', 'max').
    :return: Pandas DataFrame containing commodity price data.
    """
    try:
        commodity = yf.Ticker(commodity_ticker)
        data = commodity.history(period=period)
        return data
    except Exception as e:
        print(f"Error fetching commodity prices: {e}")
        return None
    
def fetch_bond_yields(bond_ticker: str, period: str = "1mo"):
    """
    Retrieve bond yields and government debt data using yfinance.
    
    :param bond_ticker: The bond ticker symbol (e.g., '^TNX' for 10-Year Treasury Yield, '^TYX' for 30-Year Treasury Yield).
    :param period: The time span for historical data (e.g., '1d', '5d', '1mo', '6mo', '1y', '5y', 'max').
    :return: Pandas DataFrame containing bond yield data.
    """
    try:
        bond = yf.Ticker(bond_ticker)
        data = bond.history(period=period)
        return data
    except Exception as e:
        print(f"Error fetching bond yields: {e}")
        return None

def fetch_financial_news(ticker: str):
    """
    Fetch financial news articles & headlines using yfinance.
    
    :param ticker: The stock ticker symbol (e.g., 'MSFT' for Microsoft).
    :return: List of dictionaries containing news headlines and related details.
    """
    try:
        stock = yf.Ticker(ticker)
        news = stock.news
        return news
    except Exception as e:
        print(f"Error fetching financial news: {e}")
        return None
    
def analyze_stock_volatility(ticker: str, period: str = "1y"):
    """
    Analyze stock volatility and market trends.
    
    :param ticker: The stock ticker symbol.
    :param period: The time span for historical data.
    :return: Stock volatility data.
    """
    try:
        stock = yf.Ticker(ticker)
        data = stock.history(period=period)
        volatility = data['Close'].pct_change().std()
        return volatility
    except Exception as e:
        print(f"Error analyzing stock volatility: {e}")
        return None

def fetch_financial_risk_indicators(ticker: str):
    """
    Fetch financial risk indicators like beta values.
    
    :param ticker: The stock ticker symbol.
    :return: Beta value of the stock.
    """
    try:
        stock = yf.Ticker(ticker)
        beta = stock.info.get('beta')
        return beta
    except Exception as e:
        print(f"Error fetching financial risk indicators: {e}")
        return None


# forex_df = fetch_forex_rates("EURUSD=X", "1mo")
# print(forex_df.head())
 
# Example usage:
# df = fetch_stock_prices("AMZN", "1wk")
# print(df.head())
# print(df)

# index_df = fetch_market_indices("^GDAXI", "1mo")
# print(index_df.head())

# forex_df = fetch_forex_rates("EURCHF=X", "1wk")
# print(forex_df)

# financials = fetch_company_financials("TSLA")
# print(financials)

# ratings = fetch_analyst_ratings("NVDA")
# print(ratings)

# commodity_prices = fetch_commodity_prices("ALI=F", "1mo")
# print(commodity_prices.head())

# bond_data = fetch_bond_yields("^TNX", "1wk")
# print(bond_data.head())

# Fetch financial news for Microsoft (MSFT)
# news_data = fetch_financial_news("NVDA")
# import json
# print(json.dumps(news_data, indent=4))


# volatility = analyze_stock_volatility("NVDA", "1wk")
# if volatility is not None:
#     print(f"Apple's stock volatility (1-year): {volatility:.4f}")
# else:
#     print("Failed to fetch stock volatility.")

# beta = fetch_financial_risk_indicators("NVDA")
# if beta is not None:
#     print(f"Apple's beta value: {beta}")
# else:
#     print("Failed to fetch beta value.")

