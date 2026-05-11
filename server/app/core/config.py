import secrets
import warnings
from pathlib import Path
from typing import Annotated, Any, Literal

from pydantic import AnyUrl, BeforeValidator, HttpUrl, computed_field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Self


BASE_DIR = Path(__file__).resolve().parents[3]
ENV_FILE = BASE_DIR / "server" / ".env"


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",") if i.strip()]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_ignore_empty=True,
        extra="ignore",
    )

    API_V1_STR: str = "/api/v1"
    SUPABASE_KEY: str = secrets.token_urlsafe(32)
    SUPABASE_URL: str = secrets.token_urlsafe(32)
    OPENAI_API_KEY: str = secrets.token_urlsafe(32)

    #stripe keys
    STRIPE_SECRET_KEY: str = secrets.token_urlsafe(32)
    STRIPE_PUBLISHABLE_KEY: str = secrets.token_urlsafe(32)
    STRIPE_BASIC_PRICE_ID: str = ""
    STRIPE_PRO_PRICE_ID: str = ""
    STRIPE_PREMIUM_PRICE_ID: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    #resend keys
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev"

    # Make this optional unless you really need it everywhere
    SUPABASE_JWT_URL: HttpUrl | None = None

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    FRONTEND_HOST: str = "http://localhost:8081"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"

    BACKEND_CORS_ORIGINS: Annotated[list[AnyUrl] | str, BeforeValidator(parse_cors)] = []

    @computed_field
    @property
    def all_cors_origins(self) -> list[str]:
        origins = self.BACKEND_CORS_ORIGINS
        if isinstance(origins, str):
            origins = [origins]
        return [str(origin).rstrip("/") for origin in origins] + [self.FRONTEND_HOST]

    PROJECT_NAME: str

    def _check_default_secret(self, var_name: str, value: str | None) -> None:
        if value == "changethis":
            message = (
                f'The value of {var_name} is "changethis", '
                "for security, please change it, at least for deployments."
            )
            if self.ENVIRONMENT == "local":
                warnings.warn(message, stacklevel=1)
            else:
                raise ValueError(message)

    @model_validator(mode="after")
    def _enforce_non_default_secrets(self) -> Self:
        self._check_default_secret("SUPABASE_URL", self.SUPABASE_URL)
        self._check_default_secret("SUPABASE_KEY", self.SUPABASE_KEY)
        self._check_default_secret("OPENAI_API_KEY", self.OPENAI_API_KEY)
        return self


settings = Settings()