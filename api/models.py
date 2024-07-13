import sqlalchemy
from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    TIMESTAMP,
    JSON,
    Text,
    BigInteger,
    func,
)
from sqlalchemy.orm import relationship

from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True, unique=True, nullable=False)
    role_id = Column(BigInteger, ForeignKey("roles.id"), nullable=False)
    username = Column(String, unique=True, index=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    deleted_at = Column(TIMESTAMP(timezone=True), nullable=True)
    
    # Define relationship properties
    role = relationship("Role", backref="users")
    payment = relationship("Payment", backref="users", uselist=False)
    token = relationship("Token", backref="users", uselist=False)

    def delete(self):
        if not self.deleted_at:
            self.deleted_at = func.now()
        else:
            self.deleted_at = None


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    type = Column(String(50), nullable=False, default="user")

    def __repr__(self):
        return f"<Role(id={self.id}, type={self.type})>"
    
    role = relationship("User", backref="roles")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False)
    transaction_id = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Payment(id={self.id}, user_id={self.user_id}, amount={self.amount}, created_at={self.created_at})>"

    user = relationship("User", backref="payments")

class Token(Base):
    __tablename__ = "tokens"

    id = Column(Integer, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    reserve = Column(Integer, nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Token(id={self.id}, user_id={self.user_id}, amount={self.amount}, reserve={self.reserve}, updated_at={self.updated_at})>"

    user = relationship("User", backref="tokens")
    
class Model(Base):
    __tablename__ = 'models'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    properties = Column(JSON, nullable=False)

    def __repr__(self):
        return f"<Model(id={self.id}, name={self.name}, description={self.description}, type={self.type}, properties={self.properties})>"

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True)
    output = Column(JSON, nullable=False)

    def __repr__(self):
        return f"<Result(id={self.id}, output={self.output})>"


class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    model_id = Column(BigInteger, ForeignKey("models.id"), nullable=False)
    result_id = Column(BigInteger, ForeignKey("results.id"), nullable=True)
    input = Column(Text, nullable=False)
    analysis_type = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True), nullable=True)

    # Define relationship properties
    user = relationship("User", backref="prompts")
    model = relationship("Model", backref="prompts")
    result = relationship("Result", backref="prompts")
