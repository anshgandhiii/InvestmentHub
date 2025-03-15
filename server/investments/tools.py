import requests

class InvestmentPortalTools:
    BASE_URL = "http://127.0.0.1:8000"

    def buy_asset(self, user_id: str, asset_name: str, quantity: int) -> str:
        """Buy an asset via the transactions API."""
        try:
            asset_id = self.get_asset_id(asset_name)
            if not asset_id:
                return f"Asset '{asset_name}' not found."
            response = requests.post(
                f"{self.BASE_URL}/investment/transactions/",
                json={
                    "user_id": user_id,
                    "asset_id": asset_id,
                    "quantity": quantity,
                    "transaction_type": "buy"
                }
            )
            response.raise_for_status()
            return response.json().get('data', 'Failed to buy asset.')
        except requests.RequestException as e:
            return f"Error buying asset: {str(e)}"

    def sell_asset(self, user_id: str, asset_name: str, quantity: int) -> str:
        """Sell an asset via the transactions API."""
        try:
            asset_id = self.get_asset_id(asset_name)
            if not asset_id:
                return f"Asset '{asset_name}' not found."
            response = requests.post(
                f"{self.BASE_URL}/investment/transactions/",
                json={
                    "user_id": user_id,
                    "asset_id": asset_id,
                    "quantity": quantity,
                    "transaction_type": "sell"
                }
            )
            response.raise_for_status()
            return response.json().get('data', 'Failed to sell asset.')
        except requests.RequestException as e:
            return f"Error selling asset: {str(e)}"

    def get_portfolio(self, user_id: str) -> str:
        """Fetch user portfolio by user ID."""
        try:
            response = requests.get(
                f"{self.BASE_URL}/investment/portfolio/{user_id}/"
            )
            response.raise_for_status()
            data = response.json()
            if not data:
                return "Your portfolio is empty."
            return "\n".join([f"{item['asset']['name']}: {item['quantity']} shares" for item in data])
        except requests.RequestException as e:
            return f"Error fetching portfolio: {str(e)}"

    def get_sentiment(self, asset_name: str) -> dict:
        """Fetch sentiment for an asset."""
        try:
            response = requests.get(
                f"{self.BASE_URL}/investment/sentiment/",
                params={"asset": asset_name}
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            return {"sentiment": {"score": 0.5, "sentiment": "neutral"}}  # Fallback

    def get_asset_id(self, asset_name: str) -> str:
        """Helper to map asset name to ID."""
        try:
            response = requests.get(f"{self.BASE_URL}/investment/assets/")
            response.raise_for_status()
            assets = response.json()
            for asset in assets:
                if asset['name'].lower() == asset_name.lower():
                    return str(asset['id'])
            return None
        except requests.RequestException:
            return None

    def get_user_risk_tolerance(self, user_id: str) -> str:
        """Fetch user risk tolerance from profile."""
        try:
            response = requests.get(f"{self.BASE_URL}/user/profile/{user_id}/")
            response.raise_for_status()
            return response.json().get('risk_tolerance', 'medium')
        except requests.RequestException:
            return "medium"  # Fallback