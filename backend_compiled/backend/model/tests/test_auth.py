from datetime import timedelta
import pytest
from app.auth import verify_password, get_password_hash, create_access_token, decode_access_token

def test_password_hash_and_verify():
    pwd = "s3cr3t!"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed)
    assert not verify_password("wrong", hashed)

def test_jwt_roundtrip():
    token = create_access_token({"sub": "alice"}, expires_delta=timedelta(minutes=1))
    assert decode_access_token(token) == "alice"
