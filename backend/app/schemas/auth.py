from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: int


class AccessTokenResponse(BaseModel):
    access_token: str


class RefreshRequest(BaseModel):
    refresh_token: str