import os
from pydantic import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Echo News API"
    API_VERSION: str = "1.0.0"
    PROJECT_DESCRIPTION: str = "API for Echo - Our Shareable News platform"
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["*"]
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database settings
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "St.Clair95#")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "echo")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 