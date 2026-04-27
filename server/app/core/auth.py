import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWKClient
from pydantic import BaseModel, Field
from typing import Optional

from app.core.config import settings

security = HTTPBearer()


# 1. Define a Schema for Type Safety
class UserPayload(BaseModel):
    id: str = Field(..., alias="sub")  # Supabase auth.users.id
    email: Optional[str] = None
    role: str = Field(..., alias="role")
    app_metadata: dict = {}

    # Existing helper
    @property
    def user_role(self) -> Optional[str]:
        return self.app_metadata.get("user_role")

    # Existing helper
    @property
    def inst_id(self) -> Optional[str]:
        return self.app_metadata.get("inst_id")

    # ✅ UPDATED: NEW helper to extract public.users.id from JWT
    @property
    def user_id(self) -> Optional[str]:
        return self.app_metadata.get("user_id")


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
            algorithms=["ES256"],
            audience="authenticated",
        )

        return UserPayload(**payload)

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")


# ✅ UPDATED: NEW helper to standardise app-level user access
# This is what ALL your routes should use moving forward
async def get_current_app_user(user: UserPayload = Depends(get_current_user)) -> dict:
    """
    Returns app-level identity:
    - id = public.users.id (from JWT app_metadata)
    - inst_id = public.users.inst_id
    """

    if not user.user_id or not user.inst_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing user_id or inst_id in token metadata",
        )

    return {
        "id": user.user_id,  # ✅ public.users.id
        "inst_id": user.inst_id,
        "user_role": user.user_role,
        "auth_id": user.id,  # Supabase auth.users.id (optional)
        "email": user.email,
    }


# ✅ OPTIONAL helper (cleaner routes)
async def get_current_app_user_id(
    app_user=Depends(get_current_app_user),
) -> str:
    return app_user["id"]


# ✅ OPTIONAL helper
async def get_current_inst_id(
    app_user=Depends(get_current_app_user),
) -> str:
    return app_user["inst_id"]


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
