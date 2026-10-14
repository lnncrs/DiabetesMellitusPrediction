from importlib.metadata import PackageNotFoundError, version
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["local", "development", "test", "staging", "production"]
LogFormat = Literal["text", "json"]
LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]


def get_package_version() -> str:
    try:
        return version("diabetes-mellitus-backend")
    except PackageNotFoundError:
        return "0.1.0"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="APP_",
        extra="ignore",
    )

    service_name: str = Field(default="Diabetes Mellitus Prediction", min_length=1)
    environment: Environment = "local"
    version: str = Field(default_factory=get_package_version)
    log_level: LogLevel = "INFO"
    log_format: LogFormat = "text"
