# for pydantic models
from pydantic import BaseModel
from datetime import datetime


class UserBase(BaseModel):
    username: str

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime

    class Config:
        orm_mode = True

