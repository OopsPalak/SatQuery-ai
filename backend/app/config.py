import os
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    backend_host: str = Field(default="127.0.0.1", alias="BACKEND_HOST")
    backend_port: int = Field(default=8000, alias="BACKEND_PORT")
    frontend_origin: str = Field(default="http://localhost:5173", alias="FRONTEND_ORIGIN")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

    @property
    def cors_origins(self) -> list[str]:
        origins = [orig.strip() for orig in self.frontend_origin.split(",") if orig.strip()]
        defaults = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
        for d in defaults:
            if d not in origins:
                origins.append(d)
        return origins


settings = Settings()
