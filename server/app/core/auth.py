import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWKClient
from pydantic import BaseModel, Field
from typing import Optional

from app.core.config import settings

security = HTTPBearer()


# 1. Define a Schema for Type Safety (like the "from_attributes" we discussed!)
class UserPayload(BaseModel):
    id: str = Field(..., alias="sub")
    email: Optional[str] = None
    role: str = Field(..., alias="role")
    app_metadata: dict = {}

    @property
    def user_role(self) -> Optional[str]:
        return self.app_metadata.get("user_role")

    @property
    def inst_id(self) -> Optional[str]:
        return self.app_metadata.get("inst_id")


# Cache the JWK Client to avoid fetching it every request
jwks_client = PyJWKClient(settings.SUPABASE_JWT_URL)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UserPayload:
    """Decodes and validates the Supabase JWT."""
    token = credentials.credentials

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],  # Supabase usually uses RS256 or HS256
            audience="authenticated",
        )

        return UserPayload(**payload)

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")


async def verify_admin(
    request: Request, user: UserPayload = Depends(get_current_user)
) -> UserPayload:
    """Checks if the user is an admin AND belongs to the correct institution."""

    # 1. Check Role
    if user.user_role != "institution_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    # 2. Match Institution ID from URL
    url_inst_id = request.path_params.get("inst_id")
    if url_inst_id and user.inst_id != url_inst_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Institution mismatch",
        )

    return user


"""
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
"""
