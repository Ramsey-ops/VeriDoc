from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = Field("VeriDoc", env="APP_NAME")
    API_V1_STR: str = Field("/api/v1", env="API_V1_STR")
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(60, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    STORAGE_PATH: str = Field("./storage", env="STORAGE_PATH")
    PUBLIC_BASE_URL: str = Field("http://localhost:8000", env="PUBLIC_BASE_URL")
    FRONTEND_PUBLIC_URL: str = Field("http://127.0.0.1:5173", env="FRONTEND_PUBLIC_URL")
    ADMIN_USERNAME: str = Field("admin", env="ADMIN_USERNAME")
    ADMIN_PASSWORD: str = Field("admin123", env="ADMIN_PASSWORD")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
