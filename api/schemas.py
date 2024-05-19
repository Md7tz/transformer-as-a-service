# for pydantic models
from pydantic import BaseModel, Optional, Field
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserSchema(UserBase):
    id: Optional[int]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime]

    class Config:
        orm_mode = True

# Pydantic schema
class ModelSchema(BaseModel):
    id: Optional[int]
    name: str
    description: str
    type: str
    properties: dict

    class Config:
        orm_mode = True


class PromptSchema(BaseModel):
    id: Optional[int]
    user_id: int
    model_id: int
    result_id: int
    input: str
    analysis_type: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime]

    class Config:
        orm_mode = True

class ResultSchema(BaseModel):
    id: Optional[int]
    output: dict

    class Config:
        orm_mode = True