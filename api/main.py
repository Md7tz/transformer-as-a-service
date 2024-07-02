import stripe

from typing import Annotated
from fastapi import FastAPI, Depends
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from database import SessionLocal
from dotenv import load_dotenv
from config import get_settings
from dependencies import get_jwt

from auth.router import router as auth_router
from sentiment.router import router as sentiment_router
from ner.router import router as ner_router
from user.router import router as user_router

from runners.tokens import replenish_tokens

load_dotenv()

app = FastAPI(root_path="/api")
scheduler = BackgroundScheduler()

def job():
    db = SessionLocal()
    try:
        replenish_tokens(db);
    finally:
        db.close()

app.include_router(auth_router)
app.include_router(sentiment_router)
app.include_router(ner_router)
app.include_router(user_router)

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:3000",
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

stripe.api_key = get_settings().stripe_secret_key

# Schedule the job to run every night at midnight
scheduler.add_job(job, 'cron', hour=0, minute=0)
# For testing purposes, schedule the job to run every minute
# scheduler.add_job(job, 'interval', minutes=1)

@app.on_event("startup")
def startup_event():
    scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

@app.get("/")
def read_root(jwt: Annotated[dict, Depends(get_jwt)]):
    return {"message": f"Hi {jwt['name']}. Greetings from fastapi!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)

