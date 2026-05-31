"""Authentication and user management schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from ..models import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=200)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_user(cls, user) -> "UserResponse":
        return cls(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role.value,
            is_active=user.is_active,
            created_at=user.created_at,
        )


class AuthResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse


class AdminUserUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=200)


class OfficerZoneSchema(BaseModel):
    district: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    road_types: Optional[list[str]] = None


class OfficerZonesUpdate(BaseModel):
    zones: list[OfficerZoneSchema]


class OfficerZoneResponse(BaseModel):
    id: str
    district: str
    state: str
    road_types: Optional[list[str]] = None


class AnalyticsResponse(BaseModel):
    total_users: int
    total_complaints: int
    complaints_by_status: dict[str, int]
    complaints_by_severity: dict[str, int]
    users_by_role: dict[str, int]
    complaints_last_7_days: int
