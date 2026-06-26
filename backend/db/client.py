import os

import jwt as pyjwt
from jwt import PyJWKClient
from fastapi import HTTPException
from supabase import Client, create_client

_client: Client | None = None
_jwks_client: PyJWKClient | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_KEY"]
        _client = create_client(url, key)
    return _client


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        url = os.environ["SUPABASE_URL"]
        _jwks_client = PyJWKClient(f"{url}/auth/v1/.well-known/jwks.json")
    return _jwks_client


def verify_token(token: str) -> str:
    """Verify a Supabase JWT via JWKS and return the user_id (sub claim)."""
    try:
        signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
        payload = pyjwt.decode(
            token,
            signing_key,
            algorithms=["ES256", "RS256"],
            options={"verify_aud": False},
        )
    except pyjwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {exc}")

    role = payload.get("role")
    if role not in ("authenticated", "service_role"):
        raise HTTPException(status_code=401, detail=f"Token role '{role}' is not permitted")

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing sub claim")
    return user_id
