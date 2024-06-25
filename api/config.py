from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    base_url: str
    database_url: str
    secret_key: str
    port: int
    nextauth_url: str
    stripe_secret_key: str
    stripe_publishable_key: str

    class Config:
        env_file = ".env"
    

@lru_cache
def get_settings():
    return Settings()
