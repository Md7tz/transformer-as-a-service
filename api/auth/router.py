from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from dependencies import get_db

from models import User
import json


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/callback")
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
