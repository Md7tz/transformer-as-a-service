from fastapi_nextauth_jwt import NextAuthJWT

from config import get_settings

JWT = NextAuthJWT(
    secret=get_settings().secret_key,
    csrf_prevention_enabled=True,
    check_expiry=True
)

# Get the JWT instance
def get_jwt():
    return JWT