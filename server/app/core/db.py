# server/app/core/db.py

from supabase import create_client, Client
from supabase.client import ClientOptions
from app.core.config import settings

supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY,  # service role key (backend only)
    options=ClientOptions(
        postgrest_client_timeout=10,
        storage_client_timeout=10,
        schema="public",
    ),
)