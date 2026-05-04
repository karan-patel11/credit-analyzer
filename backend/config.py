from __future__ import annotations

import json
from functools import lru_cache
from typing import Annotated, Any

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(default="KAPS AI Credit Intelligence API", alias="APP_NAME")
    app_description: str = Field(
        default=(
            "Production-grade financial services platform with merchant search, "
            "discovery, and AI-powered credit intelligence."
        ),
        alias="APP_DESCRIPTION",
    )
    environment: str = Field(default="development", alias="ENVIRONMENT")
    api_version: str = Field(default="1.0.0", alias="API_VERSION")
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default=["http://localhost:5173", "http://localhost:3000"],
        alias="CORS_ORIGINS",
    )

    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    groq_model: str = Field(default="llama-3.1-8b-instant", alias="GROQ_MODEL")
    groq_api_url: str = Field(
        default="https://api.groq.com/openai/v1/chat/completions",
        alias="GROQ_API_URL",
    )
    llm_timeout_seconds: float = Field(default=30.0, alias="LLM_TIMEOUT_SECONDS")
    webhook_secret: str = Field(default="kaps-demo-secret-key", alias="WEBHOOK_SECRET")

    database_url: str = Field(
        default="mysql+mysqlconnector://kaps:kaps@localhost:3306/kaps_credit",
        alias="DATABASE_URL",
    )
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")

    search_cache_ttl_seconds: int = Field(default=300, alias="SEARCH_CACHE_TTL_SECONDS")
    autocomplete_cache_ttl_seconds: int = Field(
        default=300,
        alias="AUTOCOMPLETE_CACHE_TTL_SECONDS",
    )
    industries_cache_ttl_seconds: int = Field(
        default=300,
        alias="INDUSTRIES_CACHE_TTL_SECONDS",
    )
    job_status_ttl_seconds: int = Field(default=300, alias="JOB_STATUS_TTL_SECONDS")
    rate_limit_per_minute: int = Field(default=100, alias="RATE_LIMIT_PER_MINUTE")

    auto_seed_merchants: bool = Field(default=True, alias="AUTO_SEED_MERCHANTS")
    seed_merchant_count: int = Field(default=600, alias="SEED_MERCHANT_COUNT")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> list[str]:
        """Normalize CORS origins from comma-separated strings or JSON arrays."""

        if isinstance(value, list):
            return value
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith("["):
                try:
                    parsed = json.loads(stripped)
                except json.JSONDecodeError:
                    parsed = None
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]
            origins = [item.strip() for item in value.split(",") if item.strip()]
            if origins:
                return origins
        return ["http://localhost:5173", "http://localhost:3000"]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the cached application settings instance."""

    return Settings()
