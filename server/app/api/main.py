from fastapi import APIRouter

from app.api.routes import users
from app.api.routes import news
from app.api.routes import communities
from app.api.routes.institution_admin import users as users_admin
from app.api.routes.institution_admin import categories as categories_admin
from app.api.routes.institution_admin import communities as communities_admin
from app.api.routes.platform_admin import institutions as platform_institutions
from app.api.routes.institution_admin import achievements as achievements_admin
from app.core.config import settings
from app.api.routes.institution_admin import categories as categories_admin
from app.api.routes import community_members
from app.api.routes import search

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(news.router)
api_router.include_router(communities.router)
api_router.include_router(users_admin.router)
api_router.include_router(communities_admin.router)
api_router.include_router(platform_institutions.router)
api_router.include_router(community_members.router)
api_router.include_router(search.router)
# api_router.include_router(utils.router)
# api_router.include_router(items.router)

# if settings.ENVIRONMENT == "local":
#     api_router.include_router(private.router)
api_router.include_router(categories_admin.router)
api_router.include_router(achievements_admin.router)
