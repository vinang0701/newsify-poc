# This will be used to create the connection between Supabase and our backend
import os
from supabase import create_client, Client
from supabase.client import ClientOptions
from app.core.config import settings

url: str = settings.SUPABASE_URL
key: str = settings.SUPABASE_KEY
# supabase: Client = create_client(url, key)
supabase: Client = create_client(
    url,
    key,
    options=ClientOptions(
        postgrest_client_timeout=10,
        storage_client_timeout=10,
        schema="public",
    ),
)
