from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends
from dependencies import get_jwt, get_db
from models import User, Role
from constants import ModelType
from sqlalchemy import orm

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/")
async def get_users(jwt: Annotated[dict, Depends(get_jwt)], db = Depends(get_db)):
    try:
        # get the users and their roles from the database
        users = db.query(User).options(orm.joinedload(User.role)).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get users") from e
    
    return {"users": users}

@router.get("/me")
async def get_user(jwt: Annotated[dict, Depends(get_jwt)], db = Depends(get_db)):
    try:
        # get the user and their role from the database
        user = db.query(User).filter(User.id == jwt.get("user_id")).options(orm.joinedload(User.role)).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get user") from e
    
    return {"user": user}

@router.delete("/{user_id}")
async def delete_user(user_id: int, jwt: Annotated[dict, Depends(get_jwt)], db = Depends(get_db)):
    try:
        # Check if user is an admin
        user = db.query(User).filter(User.id == jwt.get("user_id")).first()
        if user.role.type != "admin":
            raise HTTPException(status_code=403, detail="Unauthorized to delete user")
        
        user = db.query(User).filter(User.id == user_id).first()
        user.delete()
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete user") from e
    
    return {"message": "User deleted", "id": user_id}

# @router.post("/token")
# async def update_user_token(token: int, jwt: Annotated[dict, Depends(get_jwt)], db = Depends(get_db)):
#     try:
#         user = db.query(User).filter(User.id == jwt.get("user_id")).first()
#         user.token = token
#         db.commit()
#     except Exception as e:
#         raise HTTPException(status_code=500, detail="Failed to update user token") from e
    
#     return {"message": "User token updated"}