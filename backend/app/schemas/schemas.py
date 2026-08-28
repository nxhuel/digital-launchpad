from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, field_serializer


class UTCBaseModel(BaseModel):
    """Serializa las fechas guardadas como UTC (sin zona horaria) marcándolas como UTC.

    La base de datos guarda datetimes con `datetime.now(timezone.utc)` pero en columnas
    sin timezone, así que al leerlos vuelven "naive". Sin esta marca, el navegador los
    interpreta como hora local y muestra horarios corridos (ej. +3h en Argentina).
    """
    @field_serializer("*", when_used="json")
    def _mark_naive_datetimes_as_utc(self, value, _info):
        if isinstance(value, datetime) and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value


# Auth
import re


def _require_uppercase(v: str) -> str:
    # Misma regla que el frontend: al menos 1 letra mayúscula A-Z
    if not re.search(r"[A-Z]", v):
        raise ValueError("La contraseña debe tener al menos 1 letra mayúscula")
    return v


class RegisterRequest(UTCBaseModel):
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


class LoginRequest(UTCBaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., max_length=128)


class VerifyEmailRequest(UTCBaseModel):
    email: str = Field(..., max_length=255)
    code: str = Field(..., min_length=6, max_length=6)


class ResendVerificationRequest(UTCBaseModel):
    email: str = Field(..., max_length=255)


class ForgotPasswordRequest(UTCBaseModel):
    email: str = Field(..., max_length=255)


class ResetPasswordRequest(UTCBaseModel):
    email: str = Field(..., max_length=255)
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def new_password_uppercase(cls, v: str) -> str:
        return _require_uppercase(v)


class MessageResponse(UTCBaseModel):
    message: str


class TokenResponse(UTCBaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(UTCBaseModel):
    refresh_token: str


class UserOut(UTCBaseModel):
    id: int
    name: str
    email: str
    role: str
    active: bool
    email_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# Service
class ServiceCreate(UTCBaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: str = ""
    base_price: int = Field(default=0, ge=0)
    features: List[str] = []
    icon: str = "Package"
    order: int = 0
    active: bool = True
    supports_maintenance: bool = False


class ServiceUpdate(UTCBaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    base_price: Optional[int] = Field(None, ge=0)
    features: Optional[List[str]] = None
    icon: Optional[str] = None
    order: Optional[int] = None
    active: Optional[bool] = None
    supports_maintenance: Optional[bool] = None


class ServiceOut(UTCBaseModel):
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
class ProjectCreate(UTCBaseModel):
    service_id: int = Field(..., gt=0)
    title: str = Field(..., min_length=1, max_length=255)
    description: str = ""
    budget_hint: Optional[int] = Field(None, gt=0)


class ProjectUpdate(UTCBaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    admin_price: Optional[int] = Field(None, ge=0)
    installments: Optional[int] = Field(None, ge=1, le=24)
    deposit_percentage: Optional[int] = Field(None, ge=0, le=50)
    maintenance_enabled: Optional[bool] = None
    maintenance_monthly: Optional[int] = Field(None, ge=0)


class ProjectOut(UTCBaseModel):
    id: int
    client_id: int
    service_id: int
    title: str
    description: str
    budget_hint: Optional[int]
    status: str
    admin_price: Optional[int]
    installments: int
    deposit_percentage: Optional[int] = None
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
class MessageCreate(UTCBaseModel):
    body: str = Field(..., min_length=1, max_length=10000)


class MessageOut(UTCBaseModel):
    id: int
    project_id: int
    sender_id: int
    body: str
    created_at: datetime
    sender: Optional[UserOut] = None
    attachments: List["AttachmentOut"] = []

    model_config = {"from_attributes": True}


# Attachment
class AttachmentOut(UTCBaseModel):
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
class DeliveryCreate(UTCBaseModel):
    note: str = Field(..., min_length=1, max_length=10000)
    link: Optional[str] = Field(None, max_length=500)
    attachment_ids: List[int] = []


class DeliveryUpdate(UTCBaseModel):
    note: Optional[str] = Field(None, min_length=1, max_length=10000)
    link: Optional[str] = Field(None, max_length=500)


class DeliveryOut(UTCBaseModel):
    id: int
    project_id: int
    note: str
    link: Optional[str]
    created_at: datetime
    updated_at: datetime
    attachments: List[AttachmentOut] = []

    model_config = {"from_attributes": True}


# Payment
class PaymentOut(UTCBaseModel):
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


class PaymentConfirm(UTCBaseModel):
    status: str = Field(..., pattern="^(confirmado|rechazado)$")


class PaymentMethodUpdate(UTCBaseModel):
    method: str = Field(..., pattern="^(mp_link|alias|qr|otro)$")


# Notification
class NotificationOut(UTCBaseModel):
    id: int
    user_id: int
    kind: str
    title: str
    body: str
    link: Optional[str]
    read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationReadAllResponse(UTCBaseModel):
    success: bool


class IncomeByService(UTCBaseModel):
    service_name: str
    income: int

class AdminStats(UTCBaseModel):
    total_projects: int
    active_projects: int
    total_clients: int
    monthly_income: int
    pending_payments: int
    recent_projects: List[ProjectOut] = []
    income_by_service: List[IncomeByService] = []
    pending_cards: int = 0
    recent_cards: List["CardOut"] = []


class UserUpdate(UTCBaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    active: Optional[bool] = None
    role: Optional[str] = Field(None, pattern="^(admin|client)$")


# DigitalCard
class CardCreate(UTCBaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    event_type: str = Field(...)
    event_date: Optional[str] = Field(None, max_length=50)
    chosen_design: Optional[str] = Field(None, max_length=255)
    description: str = ""


class CardUpdate(UTCBaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    event_type: Optional[str] = None
    event_date: Optional[str] = Field(None, max_length=50)
    chosen_design: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    admin_price: Optional[int] = Field(None, ge=0)
    link_entrega: Optional[str] = Field(None, max_length=500)


class CardOut(UTCBaseModel):
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


class CardMessageCreate(UTCBaseModel):
    body: str = Field(..., min_length=1, max_length=10000)


class CardMessageOut(UTCBaseModel):
    id: int
    card_id: int
    sender_id: int
    body: str
    created_at: datetime
    sender: Optional[UserOut] = None
    attachments: List[AttachmentOut] = []

    model_config = {"from_attributes": True}


class FinanceEntryCreate(UTCBaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    description: str = Field(..., min_length=1, max_length=255)
    income: Optional[int] = Field(None, ge=0)
    expense: Optional[int] = Field(None, ge=0)


class FinanceEntryUpdate(UTCBaseModel):
    date: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    income: Optional[int] = Field(None, ge=0)
    expense: Optional[int] = Field(None, ge=0)


class FinanceEntryOut(UTCBaseModel):
    id: int
    date: str
    description: str
    income: Optional[int]
    expense: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


# Card catalog (tarjetas reales subidas por el sistema)
class CardCategoryCreate(UTCBaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=100)
    description: str = ""
    order: int = 0


class ReorderRequest(UTCBaseModel):
    order: List[int] = Field(..., min_length=1)


class CardCategoryOut(UTCBaseModel):
    id: int
    slug: str
    name: str
    description: str
    order: int

    model_config = {"from_attributes": True}


class CardDesignCreate(UTCBaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category_id: int = Field(..., gt=0)
    tag: Optional[str] = Field(None, max_length=50)
    discount_label: Optional[str] = Field(None, max_length=100)
    demo_url: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    order: int = 0
    active: bool = True


class CardDesignUpdate(UTCBaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category_id: Optional[int] = Field(None, gt=0)
    tag: Optional[str] = Field(None, max_length=50)
    discount_label: Optional[str] = Field(None, max_length=100)
    demo_url: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    order: Optional[int] = None
    active: Optional[bool] = None


class CardDesignOut(UTCBaseModel):
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


class PublicCardDesignOut(UTCBaseModel):
    id: int
    name: str
    category: str  # slug
    category_name: str
    tag: Optional[str]
    discount_label: Optional[str]
    demo_url: Optional[str]
    image_url: Optional[str]


class PublicCardCatalog(UTCBaseModel):
    categories: List[CardCategoryOut]
    designs: List[PublicCardDesignOut]


# Form questions (formulario de pedido de tarjetas digitales)
class FormQuestionOut(UTCBaseModel):
    id: int
    role: Optional[str]
    field_type: str
    text: str
    order: int
    active: bool

    model_config = {"from_attributes": True}


class FormQuestionCreate(UTCBaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
    field_type: str = Field(..., pattern="^(text|longtext|url|images)$")
    order: int = 0
    active: bool = True


class FormQuestionUpdate(UTCBaseModel):
    text: Optional[str] = Field(None, min_length=1, max_length=1000)
    field_type: Optional[str] = Field(None, pattern="^(text|longtext|url|images)$")
    order: Optional[int] = None
    active: Optional[bool] = None


# Flujo de autoatención de pedidos (formulario → proyecto + chat inicial)
class OrderImageItem(UTCBaseModel):
    url: str = Field(..., min_length=1, max_length=500)
    filename: str = ""
    mime: str = ""
    size: int = 0


class OrderExchangeItem(UTCBaseModel):
    """Una pregunta del formulario (fuera de título/descripción/referencia) y su respuesta.

    Se vuelca al chat inicial: el equipo hace la pregunta y el cliente responde (texto o imágenes).
    """
    question: str = Field(..., min_length=1, max_length=1000)
    answer: str = Field("", max_length=10000)
    images: List[OrderImageItem] = []


class OrderProjectCreate(UTCBaseModel):
    title: str = Field("", max_length=255)
    description: str = Field("", max_length=10000)
    references: str = Field("", max_length=5000)
    design_id: Optional[int] = None
    design_name: str = Field("", max_length=255)
    source: str = Field("custom", pattern="^(custom|template)$")
    exchanges: List[OrderExchangeItem] = []


class UploadedFileOut(UTCBaseModel):
    url: str
    filename: str
    mime: str
    size: int


# --- Monthly expenses (gastos del mes) ---


class MonthlyExpenseCreate(UTCBaseModel):
    service_name: str = Field(..., min_length=1, max_length=255)
    amount: int = Field(..., gt=0)
    payment_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")


class MonthlyExpenseUpdate(UTCBaseModel):
    service_name: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[int] = Field(None, gt=0)
    payment_date: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")


class MonthlyExpenseOut(UTCBaseModel):
    id: int
    service_name: str
    amount: int
    payment_date: str
    month_key: str
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Portfolio ---

class PortfolioItemOut(UTCBaseModel):
    id: int
    title: str
    category: str
    site_url: str
    image_url: Optional[str] = None
    order: int
    active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PortfolioItemCreate(UTCBaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    site_url: str = Field(..., min_length=1, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    order: int = 0
    active: bool = True


class PortfolioItemUpdate(UTCBaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    site_url: Optional[str] = Field(None, min_length=1, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    order: Optional[int] = None
    active: Optional[bool] = None
