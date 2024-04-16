from typing import Annotated
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi_nextauth_jwt import NextAuthJWT


from dotenv import load_dotenv
from config import get_settings
from auth.router import router as auth_router
load_dotenv()

app = FastAPI(root_path="/api")
app.include_router(auth_router)

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

@app.get("/")
def read_root(jwt: Annotated[dict, Depends(JWT)]):
    print(jwt)
    return {"message": f"Hi {jwt['name']}. Greetings from fastapi!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)

