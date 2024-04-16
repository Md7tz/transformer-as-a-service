import os
from typing import Annotated
from fastapi import FastAPI, Depends, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi_nextauth_jwt import NextAuthJWT

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User
import json

from dotenv import load_dotenv
from config import get_settings
load_dotenv()

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8000",
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

app.add_middleware(SessionMiddleware, secret_key=get_settings().secret_key)
JWT = NextAuthJWT(
    secret=get_settings().secret_key,
    csrf_prevention_enabled=True,
    check_expiry=True
)


# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api")
def read_root(jwt: Annotated[dict, Depends(JWT)]):
    print(jwt)
    return {"message": f"Hi {jwt['name']}. Greetings from fastapi!"}

@app.post("/api/auth/callback")
async def handle_callback(user_data: dict, db: Session = Depends(get_db)):
    # Extract user data from the request body
    user = user_data['user']
    provider = user_data['provider']
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == user["email"]).first()
    if existing_user:
        # print(existing_user.username)
        # Return response if user already exists
        return Response(content=json.dumps({"message": "User already exists"}), status_code=200)
        

    # Create a new User instance
    new_user = User(username=user["email"])

    # Add the new user to the database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully", "user": new_user}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)



# Scheme for the Authorization header
# auth = VerifyToken()
# from utils import VerifyToken

# @app.on_event("startup")
# async def startup():
#     await database.connect()

# @app.on_event("shutdown")
# async def shutdown():
#     await database.disconnect()

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

# @app.get('/api/public')
# def public():
#     """No access token required to access this route"""

#     result = {
#         "status": "success",
#         "msg": ("Hello from a public endpoint! You don't need to be "
#                 "authenticated to see this.")
#     }
#     return result


# @app.get("/api/private")
# def private(auth_result: str = Depends(auth.verify)):
#     """A valid access token is required to access this route"""

#     # result = token.credentials

#     return auth_result


