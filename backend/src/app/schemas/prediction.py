from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PredictionInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        allow_inf_nan=False,
        json_schema_extra={
            "example": {
                "gestacoes": 0,
                "glicose_plasmatica": 171,
                "pressao_arterial_diastolica": 80,
                "espessura_triceps": 34,
                "insulina_serica": 23,
                "imc": 43.50972593,
                "indice_hereditariedade_diabetes": 1.213191354,
                "idade": 21,
            }
        },
    )

    gestacoes: int = Field(ge=0, strict=True, description="Número de gestações")
    glicose_plasmatica: int = Field(ge=0, strict=True)
    pressao_arterial_diastolica: int = Field(ge=0, strict=True)
    espessura_triceps: int = Field(ge=0, strict=True)
    insulina_serica: int = Field(ge=0, strict=True)
    imc: float = Field(ge=0)
    indice_hereditariedade_diabetes: float = Field(ge=0)
    idade: int = Field(ge=0, strict=True, description="Idade em anos")


class PredictionOutput(BaseModel):
    predicted_class: Literal[0, 1]
    probability_diabetes: float = Field(ge=0, le=1)
    model_name: str
    model_version: int
