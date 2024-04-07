import os
import databases
import sqlalchemy
from typing import Optional, List
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

from utils import VerifyToken

load_dotenv()

# Scheme for the Authorization header
auth = VerifyToken()
DATABASE_URL = os.getenv("DATABASE_URL")

database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

users = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("username", sqlalchemy.String(255), nullable=False),
    sqlalchemy.Column("created_at", sqlalchemy.TIMESTAMP(timezone=True), server_default=sqlalchemy.func.now()),
    sqlalchemy.Column("updated_at", sqlalchemy.TIMESTAMP(timezone=True), server_default=sqlalchemy.func.now(), onupdate=sqlalchemy.func.now()),
    sqlalchemy.Column("deleted_at", sqlalchemy.TIMESTAMP(timezone=True)),
)

engine = sqlalchemy.create_engine(DATABASE_URL)

# metadata.create_all(engine)
# automatically creates the database tables based on your sqlalchemy table definitions. 
# Since we’re using alembic, we don’t need this, so we will comment it out.

class UserIn(BaseModel):
    username: str

class User(BaseModel):
    id: int
    username: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    
app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
]

# CORS middleware so that we can call the API from the browser at a different domain than the API itself.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()



# @app.get("/users/", response_model=List[User])
# async def read_users():
#     query = users.select()
#     return await database.fetch_all(query)

# @app.post("/users/", response_model=User)
# async def create_user(user: UserIn):
#     print(user)
#     query = users.insert().values(username=user.username)
#     last_record_id = await database.execute(query)
#     return {**user.dict(), "id": last_record_id}

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get('/api/public')
def public():
    """No access token required to access this route"""

    result = {
        "status": "success",
        "msg": ("Hello from a public endpoint! You don't need to be "
                "authenticated to see this.")
    }
    return result


@app.get("/api/private")
def private(auth_result: str = Depends(auth.verify)):
    """A valid access token is required to access this route"""

    # result = token.credentials

    return auth_result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

