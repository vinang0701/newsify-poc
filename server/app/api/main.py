from fastapi import APIRouter

# from app.api.routes import items, login, private, users, utils
from app.api.routes import users
from app.api.routes import news
from app.api.routes import communities
from app.api.routes.institution_admin import users as users_admin
from app.api.routes.institution_admin import communities as communities_admin
from app.api.routes.platform_admin import institutions as platform_institutions
from app.api.routes import categories
from app.core.config import settings
from app.api.routes import community_members
from app.api.routes import search

api_router = APIRouter()
# api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(news.router)
api_router.include_router(communities.router)
api_router.include_router(users_admin.router)
api_router.include_router(communities_admin.router)
api_router.include_router(platform_institutions.router)
api_router.include_router(categories.router)
api_router.include_router(community_members.router)
api_router.include_router(search.router)
# api_router.include_router(utils.router)
# api_router.include_router(items.router)

# if settings.ENVIRONMENT == "local":
#     api_router.include_router(private.router)
