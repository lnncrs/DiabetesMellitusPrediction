from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: Literal["ok"]
    service_name: str = Field(serialization_alias="serviceName")
    version: str
    environment: str
    checks: dict[str, str] = Field(default_factory=dict)
