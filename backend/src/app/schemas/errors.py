from pydantic import BaseModel, ConfigDict, Field


class ErrorResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: str
    title: str
    status: int
    detail: str
    request_id: str | None = Field(serialization_alias="requestId")
