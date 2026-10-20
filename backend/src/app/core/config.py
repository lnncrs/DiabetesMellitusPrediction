from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from typing import Literal

from pydantic import Field, HttpUrl, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["local", "development", "test", "staging", "production"]
LogFormat = Literal["text", "json"]
LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
ModelVersion = int | Literal["latest"]


def get_package_version() -> str:
    try:
        return version("diabetes-mellitus-backend")
    except PackageNotFoundError:
        return "0.1.0"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[3] / ".env",
        env_prefix="APP_",
        extra="ignore",
    )

    service_name: str = Field(default="Diabetes Mellitus Prediction", min_length=1)
    environment: Environment = "local"
    version: str = Field(default_factory=get_package_version)
    log_level: LogLevel = "INFO"
    log_format: LogFormat = "text"
    mlflow_tracking_uri: HttpUrl = HttpUrl("http://127.0.0.1:5000")
    mlflow_model_name: str | None = Field(default=None, pattern=r"^[A-Za-z0-9_.-]+$")
    mlflow_model_version: ModelVersion | None = Field(default=None)

    @model_validator(mode="after")
    def validate_model_configuration(self) -> Settings:
        if (self.mlflow_model_name is None) != (self.mlflow_model_version is None):
            raise ValueError("Configure nome e versão do modelo juntos.")
        if (
            isinstance(self.mlflow_model_version, int)
            and self.mlflow_model_version <= 0
        ):
            raise ValueError(
                "A versão do modelo deve ser um inteiro positivo ou 'latest'."
            )
        return self
