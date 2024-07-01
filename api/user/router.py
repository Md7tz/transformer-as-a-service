import stripe
import json

from config import get_settings
from constants import ModelType
from dependencies import get_jwt, get_db
from fastapi import APIRouter, HTTPException, Depends, responses, Request
from models import User, Role, Token, Payment, Model, Result, Prompt
from sqlalchemy import orm
from typing import Annotated


router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/", tags=["admin"])
async def get_users(jwt: Annotated[dict, Depends(get_jwt)], db = Depends(get_db)):
    if jwt.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to get users")
    try:
        # get the users and their roles from the database
        users = db.query(User)\
            .options(orm.joinedload(User.role), orm.joinedload(User.token))\
            .all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get users") from e
    
    return {"users": users}

@router.get("/me")
async def get_user(jwt: Annotated[dict, Depends(get_jwt)], db = Depends(get_db)):
    try:
        # get the user and their role from the database
        user = db.query(User)\
            .filter(User.id == jwt.get("user_id"))\
            .options(orm.joinedload(User.role), orm.joinedload(User.token))\
            .first()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get user") from e
    
    return {"user": user}

@router.delete("/{user_id}")
async def delete_user(user_id: int, jwt: Annotated[dict, Depends(get_jwt)], db = Depends(get_db)):
    if jwt.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to get users")
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
    if user.deleted_at is None:
        return {"message": "User undeleted successfully", "id": user_id}
    return {"message": "User deleted successfully", "id": user_id}


@router.delete("/history/{prompt_id}")
async def delete_history(prompt_id: int, jwt: Annotated[dict, Depends(get_jwt)], db = Depends(get_db)):
    # delete result id with prompt id
    try:
        # Find the prompt by ID
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        if not prompt:
            raise HTTPException(status_code=404, detail="Prompt not found")

        # Find the result associated with the prompt
        result = db.query(Result).filter(Result.id == prompt.result_id).first()
        if result:
            db.delete(result)

        # Delete the prompt
        db.delete(prompt)

        # Commit the changes to the database
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete history") from e

    return {"message": "History deleted successfully", "id": prompt_id}


@router.patch("/token")
async def update_user_token(request: dict, jwt: Annotated[dict, Depends(get_jwt)], db = Depends(get_db)):
    if jwt.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to get users")
    try:
        user_id = request.get("user_id")
        amount = request.get("amount")
        reserve = request.get("reserve")
        # Check if user is an admin
        admin_user = db.query(User)\
            .filter(User.id == jwt.get("user_id"), User.deleted_at.is_(None))\
            .first()
        if admin_user.role.type != "admin":
            raise HTTPException(status_code=403, detail="Unauthorized to update user token")
        
        # Find the user and update their token
        user_to_update = db.query(User)\
            .filter(User.id == user_id, User.deleted_at.is_(None))\
            .first()
        if user_to_update is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Assuming each user has a single token entry
        token = db.query(Token)\
            .filter(Token.user_id == user_to_update.id)\
            .first()
        if token:
            if amount:
                token.amount = amount
            if reserve:
                token.reserve = reserve
            # token.updated_at = func.now()
        else:
            # Create a new token entry if it doesn't exist
            token = Token(user_id=user_to_update.id, amount=amount, reserve=0)
            db.add(token)
        
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update user token") from e
    
    return {"message": "User token updated"}

@router.get("/models")
async def get_models(jwt: Annotated[dict, Depends(get_jwt)], db = Depends(get_db)):
    try:
        models = db.query(Model).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get models") from e
    
    return {"models": models}


@router.get("/payment/checkout")
async def create_checkout_session(jwt: Annotated[dict, Depends(get_jwt)]):
    checkout_session = stripe.checkout.Session.create(
        line_items=[
            {
                "price_data": {
                    "currency": "myr",
                    "product_data": {
                        "name": "100 Inference Tokens",
                    },
                    "unit_amount": 10 * 100,
                },
                "quantity": 1,
            }
        ],
        metadata={
            "user_id": jwt.get("user_id"),
        },
        mode="payment",
        success_url='http://localhost:3000' + "/?redirect=payment-success",
        cancel_url='http://localhost:3000' + "/?redirect=payment-failed",
        customer_email=jwt.get("email"),
    )
    # print(checkout_session.url)
    # return responses.RedirectResponse(checkout_session.url, status_code=303)
    return {"url": checkout_session.url}


@router.post("/payment/webhook")
async def stripe_webhook(request: Request, db = Depends(get_db)):
    payload = await request.body()
    event = None

    try:
        event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
    except ValueError as e:
        print("Invalid payload")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        print("Invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    print("event received is", event)
    if event["type"] == "checkout.session.completed":
        rate = 10
        payment = event["data"]["object"]
        amount = payment["amount_total"]
        currency = payment["currency"]
        user_id = payment["metadata"]["user_id"] # get custom user id from metadata
        user_email = payment["customer_details"]["email"]
        # user_name = payment["customer_details"]["name"]
        transaction_id = payment["id"]
        # save to db
        # send email in background task
        # update users tokens in db
        try:
            token = db.query(Token).filter(Token.user_id == user_id).first()
            print(token)
            token.reserve += amount / rate
            db.commit()
        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="Failed to update user token") from e

        # save payment record to db
        payment = Payment(user_id=user_id, amount=amount/rate, currency=currency, transaction_id=transaction_id)
        db.add(payment)
        db.commit()

    return {}