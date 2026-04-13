import jwt
import requests
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.db import supabase

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        jwks_client = PyJWKClient(settings.SUPABASE_JWT_URL)
        token = credentials.credentials
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        data = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
        )
        return data
    except jwt.exceptions.PyJWKClientError as e:
        print(f"JWKS Fetch error: {e}")
    except jwt.ExpiredSignatureError:
        print("Token has expired.")
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {e}")


# Admin-specific dependency
async def verify_admin(request: Request, user: dict = Depends(get_current_user)):

    role = user["app_metadata"]["user_role"]
    jwt_inst_id = user.get("app_metadata", {}).get("inst_id")
    url_inst_id = request.path_params.get("inst_id")
    if role != "institution_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    if jwt_inst_id != url_inst_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Institution mismatch",
        )

    return user
