from fastapi import Depends, HTTPException
from database import SessionLocal
from fastapi_nextauth_jwt import NextAuthJWT
from config import get_settings
from jose import JWTError
from models import User

JWT = NextAuthJWT(
    secret=get_settings().secret_key,
    csrf_prevention_enabled=True,
    check_expiry=True
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get the JWT instance
def get_jwt(jwt: dict = Depends(JWT), db = Depends(get_db)):
    try:
        email = jwt.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in JWT")
        
        # Fetch the user from the database based on the email
        user = db.query(User).filter(User.username == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Add the user_id to the JWT payload
        jwt["user_id"] = user.id

        return jwt
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Could not validate credentials: {e}")
    