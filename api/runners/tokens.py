from datetime import datetime
from sqlalchemy.orm import Session
from database import get_db
from models import Token

def replenish_tokens(db: Session):
    tokens = db.query(Token).all()
    for token in tokens:
        token.amount = 100  # Assume max_tokens is a field in your User model
        db.commit()

    print(f"Tokens replenished at {datetime.now()}")
