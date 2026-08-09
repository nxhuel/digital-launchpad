from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


# Auth
import re


def _require_uppercase(v: str) -> str:
    # Misma regla que el frontend: al menos 1 letra mayúscula A-Z
    if not re.search(r"[A-Z]", v):
        raise ValueError("La contraseña debe tener al menos 1 letra mayúscula")
    return v


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        email = v.strip().lower()
        if not email or "@" not in email or " " in email:
            raise ValueError("Email inválido")
        return email

    @field_validator("password")
    @classmethod
    def password_uppercase(cls, v: str) -> str:
        return _require_uppercase(v)


class LoginRequest(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., max_length=128)


class VerifyEmailRequest(BaseModel):
    email: str = Field(..., max_length=255)
    code: str = Field(..., min_length=6, max_length=6)


class ResendVerificationRequest(BaseModel):
    email: str = Field(..., max_length=255)


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., max_length=255)


class ResetPasswordRequest(BaseModel):
    email: str = Field(..., max_length=255)
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def new_password_uppercase(cls, v: str) -> str:
        return _require_uppercase(v)


class MessageResponse(BaseModel):
    message: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    active: bool
    email_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# Service
class ServiceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: str = ""
    base_price: int = Field(default=0, ge=0)
    features: List[str] = []
    icon: str = "Package"
    order: int = 0
    active: bool = True
    supports_maintenance: bool = False


class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    base_price: Optional[int] = Field(None, ge=0)
    features: Optional[List[str]] = None
    icon: Optional[str] = None
    order: Optional[int] = None
    active: Optional[bool] = None
    supports_maintenance: Optional[bool] = None


class ServiceOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    base_price: int
    features: List[str]
    icon: str
    order: int
    active: bool
    supports_maintenance: bool

    model_config = {"from_attributes": True}


# Project
class ProjectCreate(BaseModel):
    service_id: int = Field(..., gt=0)
    title: str = Field(..., min_length=1, max_length=255)
    description: str = ""
    budget_hint: Optional[int] = Field(None, gt=0)


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    admin_price: Optional[int] = Field(None, ge=0)
    installments: Optional[int] = Field(None, ge=1, le=24)
    maintenance_enabled: Optional[bool] = None
    maintenance_monthly: Optional[int] = Field(None, ge=0)


class ProjectOut(BaseModel):
    id: int
    client_id: int
    service_id: int
    title: str
    description: str
    budget_hint: Optional[int]
    status: str
    admin_price: Optional[int]
    installments: int
    maintenance_enabled: bool
    maintenance_monthly: Optional[int]
    accepted_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    next_due_date: Optional[datetime] = None
    client: Optional[UserOut] = None
    service: Optional[ServiceOut] = None

    model_config = {"from_attributes": True}


# Message
class MessageCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=10000)


class MessageOut(BaseModel):
    id: int
    project_id: int
    sender_id: int
    body: str
    created_at: datetime
    sender: Optional[UserOut] = None
    attachments: List["AttachmentOut"] = []

    model_config = {"from_attributes": True}


# Attachment
class AttachmentOut(BaseModel):
    id: int
    owner_type: str
    owner_id: int
    filename: str
    mime: str
    size: int
    url: str
    uploaded_by: int
    created_at: datetime

    model_config = {"from_attributes": True}


# DeliveryRecord
class DeliveryCreate(BaseModel):
    note: str = Field(..., min_length=1, max_length=10000)
    link: Optional[str] = Field(None, max_length=500)
    attachment_ids: List[int] = []


class DeliveryUpdate(BaseModel):
    note: Optional[str] = Field(None, min_length=1, max_length=10000)
    link: Optional[str] = Field(None, max_length=500)


class DeliveryOut(BaseModel):
    id: int
    project_id: int
    note: str
    link: Optional[str]
    created_at: datetime
    updated_at: datetime
    attachments: List[AttachmentOut] = []

    model_config = {"from_attributes": True}


# Payment
class PaymentOut(BaseModel):
    id: int
    project_id: int
    amount: int
    kind: str
    installment_number: Optional[int]
    method: Optional[str]
    status: str
    paid_at: Optional[datetime]
    created_at: datetime
    receipts: List[AttachmentOut] = []

    model_config = {"from_attributes": True}


class PaymentConfirm(BaseModel):
    status: str = Field(..., pattern="^(confirmado|rechazado)$")


class PaymentMethodUpdate(BaseModel):
    method: str = Field(..., pattern="^(mp_link|alias|qr|otro)$")


# Notification
class NotificationOut(BaseModel):
    id: int
    user_id: int
    kind: str
    title: str
    body: str
    link: Optional[str]
    read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationReadAllResponse(BaseModel):
    success: bool


class IncomeByService(BaseModel):
    service_name: str
    income: int

class AdminStats(BaseModel):
    total_projects: int
    active_projects: int
    total_clients: int
    monthly_income: int
    pending_payments: int
    recent_projects: List[ProjectOut] = []
    income_by_service: List[IncomeByService] = []
    pending_cards: int = 0
    recent_cards: List["CardOut"] = []


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    active: Optional[bool] = None
    role: Optional[str] = Field(None, pattern="^(admin|client)$")


# DigitalCard
class CardCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    event_type: str = Field(...)
    event_date: Optional[str] = Field(None, max_length=50)
    chosen_design: Optional[str] = Field(None, max_length=255)
    description: str = ""


class CardUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    event_type: Optional[str] = None
    event_date: Optional[str] = Field(None, max_length=50)
    chosen_design: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    admin_price: Optional[int] = Field(None, ge=0)
    link_entrega: Optional[str] = Field(None, max_length=500)


class CardOut(BaseModel):
    id: int
    client_id: int
    title: str
    event_type: str
    event_date: Optional[str]
    chosen_design: Optional[str]
    description: str
    status: str
    admin_price: Optional[int]
    link_entrega: Optional[str]
    created_at: datetime
    updated_at: datetime
    client: Optional[UserOut] = None

    model_config = {"from_attributes": True}


class CardMessageCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=10000)


class CardMessageOut(BaseModel):
    id: int
    card_id: int
    sender_id: int
    body: str
    created_at: datetime
    sender: Optional[UserOut] = None
    attachments: List[AttachmentOut] = []

    model_config = {"from_attributes": True}


class FinanceEntryCreate(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    description: str = Field(..., min_length=1, max_length=255)
    income: Optional[int] = Field(None, ge=0)
    expense: Optional[int] = Field(None, ge=0)


class FinanceEntryUpdate(BaseModel):
    date: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    income: Optional[int] = Field(None, ge=0)
    expense: Optional[int] = Field(None, ge=0)


class FinanceEntryOut(BaseModel):
    id: int
    date: str
    description: str
    income: Optional[int]
    expense: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


# Card catalog (tarjetas reales subidas por el sistema)
class CardCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=100)
    description: str = ""
    order: int = 0


class ReorderRequest(BaseModel):
    order: List[int] = Field(..., min_length=1)


class CardCategoryOut(BaseModel):
    id: int
    slug: str
    name: str
    description: str
    order: int

    model_config = {"from_attributes": True}


class CardDesignCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category_id: int = Field(..., gt=0)
    tag: Optional[str] = Field(None, max_length=50)
    discount_label: Optional[str] = Field(None, max_length=100)
    demo_url: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    order: int = 0
    active: bool = True


class CardDesignUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category_id: Optional[int] = Field(None, gt=0)
    tag: Optional[str] = Field(None, max_length=50)
    discount_label: Optional[str] = Field(None, max_length=100)
    demo_url: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    order: Optional[int] = None
    active: Optional[bool] = None


class CardDesignOut(BaseModel):
    id: int
    name: str
    category_id: int
    tag: Optional[str]
    discount_label: Optional[str]
    demo_url: Optional[str]
    image_url: Optional[str]
    order: int
    active: bool
    created_at: datetime
    updated_at: datetime
    category: Optional[CardCategoryOut] = None

    model_config = {"from_attributes": True}


class PublicCardDesignOut(BaseModel):
    id: int
    name: str
    category: str  # slug
    category_name: str
    tag: Optional[str]
    discount_label: Optional[str]
    demo_url: Optional[str]
    image_url: Optional[str]


class PublicCardCatalog(BaseModel):
    categories: List[CardCategoryOut]
    designs: List[PublicCardDesignOut]
