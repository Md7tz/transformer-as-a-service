# for db models

import sqlalchemy
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, TIMESTAMP
from sqlalchemy.orm import relationship

from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=sqlalchemy.func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=sqlalchemy.func.now(), onupdate=sqlalchemy.func.now())
    deleted_at = Column(TIMESTAMP(timezone=True), nullable=True)
    
