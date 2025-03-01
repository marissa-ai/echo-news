from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.core.config import settings
from app.api.endpoints import votes, auth, articles, comments, users, search

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    description=settings.PROJECT_DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(votes.router, prefix=f"{settings.API_V1_STR}/votes", tags=["votes"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(articles.router, prefix=f"{settings.API_V1_STR}/articles", tags=["articles"])
app.include_router(comments.router, prefix=f"{settings.API_V1_STR}/comments", tags=["comments"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(search.router, prefix=f"{settings.API_V1_STR}/search", tags=["search"])

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "ok", "timestamp": time.time()}

@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {"message": "Welcome to Echo API. See /docs for API documentation."} 