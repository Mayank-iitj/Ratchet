import os
import time
import httpx
from authlib.jose import jwt
from fastapi import HTTPException

# Load these from environment variables
GITHUB_APP_ID = os.environ.get("GITHUB_APP_ID")
GITHUB_PRIVATE_KEY = os.environ.get("GITHUB_PRIVATE_KEY")
GITHUB_WEBHOOK_SECRET = os.environ.get("GITHUB_WEBHOOK_SECRET")

def get_github_jwt() -> str:
    """Generates a JWT to authenticate as the GitHub App."""
    if not GITHUB_APP_ID or not GITHUB_PRIVATE_KEY:
        raise ValueError("GITHUB_APP_ID and GITHUB_PRIVATE_KEY must be set")
    
    # Clean up private key formatting if it was passed via single-line env var
    private_key = GITHUB_PRIVATE_KEY.replace("\\n", "\n")
    
    payload = {
        # Issued at time (10 seconds in the past to allow for clock drift)
        "iat": int(time.time()) - 10,
        # JWT expiration time (10 minutes maximum)
        "exp": int(time.time()) + (10 * 60),
        # GitHub App's identifier
        "iss": GITHUB_APP_ID
    }
    
    encoded_jwt = jwt.encode({"alg": "RS256"}, payload, private_key)
    # Authlib returns bytes, so decode to string
    return encoded_jwt.decode("utf-8") if isinstance(encoded_jwt, bytes) else encoded_jwt

async def get_installation_access_token(installation_id: int) -> str:
    """Gets a short-lived access token for a specific installation of the GitHub App."""
    app_jwt = get_github_jwt()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.github.com/app/installations/{installation_id}/access_tokens",
            headers={
                "Authorization": f"Bearer {app_jwt}",
                "Accept": "application/vnd.github.v3+json",
                "X-GitHub-Api-Version": "2022-11-28"
            }
        )
        
        if response.status_code != 201:
            raise HTTPException(status_code=500, detail=f"Failed to get installation token: {response.text}")
            
        data = response.json()
        return data["token"]

async def list_installation_repos(installation_id: int) -> list:
    """Fetches all repositories this App has been granted access to for a given installation."""
    access_token = await get_installation_access_token(installation_id)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/installation/repositories",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json",
                "X-GitHub-Api-Version": "2022-11-28"
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch repositories")
            
        return response.json().get("repositories", [])
