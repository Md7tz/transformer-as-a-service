from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from dependencies import get_db

from models import Token, User, Role
import json


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/callback")
async def handle_callback(user_data: dict, db: Session = Depends(get_db)):
    # Extract user data from the request body
    print(user_data)
    user = user_data['user']
    provider = user_data['provider']
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == user["email"]).first()
    if existing_user:
        if existing_user.deleted_at:
            # if the user is deleted send an error message
            raise HTTPException(status_code=400, detail="User no longer has access to the system")
        return Response(content=json.dumps({"message": "User already exists"}), status_code=200)
    

    role_type = "admin" if not db.query(User).first() else "user"
    new_role = Role(type=role_type)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)

    new_user = User(username=user["email"], role_id=new_role.id)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_token = Token(user_id=new_user.id, amount=100, reserve=0)
    db.add(new_token)
    db.commit()
    db.refresh(new_token)

    return {"message": "User created successfully", "user": new_user}