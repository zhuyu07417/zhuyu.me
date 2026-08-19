"""汇总所有 API 子路由，main.py 只需 include_router(api_router) 即可"""

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.github_auth import router as github_auth_router
from app.api.qq_auth_new import router as qq_auth_router
from app.api.posts import router as posts_router
from app.api.categories import router as categories_router
from app.api.tags import router as tags_router
from app.api.comments import router as comments_router
from app.api.messages import router as messages_router
from app.api.chatters import router as chatters_router
from app.api.albums import router as albums_router
from app.api.friend_links import router as friend_links_router
from app.api.site_config import router as site_config_router
from app.api.upload import router as upload_router
from app.api.bookmarks import router as bookmarks_router
from app.api.visitors import router as visitors_router
from app.api.dashboard import router as dashboard_router
from app.api.music import router as music_router
from app.api.admin_users import router as admin_users_router
from app.api.session_manage import router as session_manage_router
from app.api.admin_tokens import router as admin_tokens_router
from app.api.permanent_token import router as permanent_token_router
from app.api.friend_link_apply import router as friend_link_apply_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(github_auth_router)
api_router.include_router(qq_auth_router)
api_router.include_router(posts_router)
api_router.include_router(categories_router)
api_router.include_router(tags_router)
api_router.include_router(comments_router)
api_router.include_router(messages_router)
api_router.include_router(chatters_router)
api_router.include_router(albums_router)
api_router.include_router(friend_links_router)
api_router.include_router(site_config_router)
api_router.include_router(upload_router)
api_router.include_router(bookmarks_router)
api_router.include_router(visitors_router)
api_router.include_router(dashboard_router)
api_router.include_router(music_router)
api_router.include_router(admin_users_router)
api_router.include_router(session_manage_router)
api_router.include_router(admin_tokens_router)
api_router.include_router(permanent_token_router)
api_router.include_router(friend_link_apply_router)
