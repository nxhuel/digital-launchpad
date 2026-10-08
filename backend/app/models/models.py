import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime,
    ForeignKey, Enum as SAEnum, JSON
)
from sqlalchemy.orm import relationship

from backend.app.core.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    client = "client"


class ProjectStatus(str, enum.Enum):
    pendiente = "pendiente"
    cotizado = "cotizado"
    aceptado = "aceptado"
    desarrollo = "desarrollo"
    entregado = "entregado"
    completado = "completado"
    rechazado = "rechazado"


class PaymentKind(str, enum.Enum):
    project = "project"
    maintenance = "maintenance"
    deposit = "deposit"


class PaymentStatus(str, enum.Enum):
    pendiente = "pendiente"
    confirmado = "confirmado"
    rechazado = "rechazado"


class PaymentMethod(str, enum.Enum):
    mp_link = "mp_link"
    alias = "alias"
    qr = "qr"
    otro = "otro"


class AttachmentOwnerType(str, enum.Enum):
    message = "message"
    delivery = "delivery"
    payment_receipt = "payment_receipt"
    card_message = "card_message"


class CardStatus(str, enum.Enum):
    pendiente = "pendiente"
    en_proceso = "en_proceso"
    entregada = "entregada"
    completada = "completada"
    cancelada = "cancelada"


class CardEventType(str, enum.Enum):
    casamiento = "casamiento"
    xv = "xv"
    cumpleanos = "cumpleanos"
    bautismo = "bautismo"
    empresarial = "empresarial"
    otro = "otro"


class NotificationKind(str, enum.Enum):
    user_registered = "user_registered"
    project_created = "project_created"
    project_status_changed = "project_status_changed"
    new_message = "new_message"
    payment_uploaded = "payment_uploaded"
    payment_confirmed = "payment_confirmed"
    delivery_added = "delivery_added"
    card_created = "card_created"
    card_status_changed = "card_status_changed"


class AuthCodePurpose(str, enum.Enum):
    email_verification = "email_verification"
    password_reset = "password_reset"


class FormQuestionRole(str, enum.Enum):
    """Roles fijos que alimentan el autocompletado del proyecto y el chat inicial."""
    title = "title"
    description = "description"
    reference = "reference"
    detail = "detail"
    images = "images"


class FormQuestionFieldType(str, enum.Enum):
    text = "text"
    longtext = "longtext"
    url = "url"
    images = "images"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.client, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    token_version = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    projects = relationship("Project", back_populates="client", foreign_keys="Project.client_id")
    cards = relationship("DigitalCard", back_populates="client", foreign_keys="DigitalCard.client_id")
    auth_codes = relationship("AuthCode", back_populates="user", cascade="all, delete-orphan")


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False, default="")
    base_price = Column(Integer, nullable=False, default=0)
    features = Column(JSON, default=list, nullable=False)
    icon = Column(String(100), nullable=False, default="Package")
    order = Column(Integer, default=0, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    supports_maintenance = Column(Boolean, default=False, nullable=False)

    projects = relationship("Project", back_populates="service")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False, default="")
    budget_hint = Column(Integer, nullable=True)
    status = Column(SAEnum(ProjectStatus), default=ProjectStatus.pendiente, nullable=False, index=True)
    admin_price = Column(Integer, nullable=True)
    installments = Column(Integer, default=1, nullable=False)
    deposit_percentage = Column(Integer, nullable=True)  # None=sin seña, 25 o 50 (%)
    maintenance_enabled = Column(Boolean, default=False, nullable=False)
    maintenance_monthly = Column(Integer, nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    client = relationship("User", back_populates="projects", foreign_keys=[client_id])
    service = relationship("Service", back_populates="projects")
    messages = relationship("Message", back_populates="project", cascade="all, delete-orphan")
    deliveries = relationship("DeliveryRecord", back_populates="project", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="project", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    project = relationship("Project", back_populates="messages")
    sender = relationship("User")
    attachments = relationship("Attachment", primaryjoin="and_(Attachment.owner_type=='message', Attachment.owner_id==Message.id)", foreign_keys="Attachment.owner_id", cascade="all, delete-orphan", overlaps="attachments")


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    owner_type = Column(SAEnum(AttachmentOwnerType), nullable=False, index=True)
    owner_id = Column(Integer, nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    mime = Column(String(100), nullable=False)
    size = Column(Integer, nullable=False)
    url = Column(String(500), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    uploader = relationship("User")


class DeliveryRecord(Base):
    __tablename__ = "delivery_records"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    note = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    project = relationship("Project", back_populates="deliveries")
    attachments = relationship("Attachment", primaryjoin="and_(Attachment.owner_type=='delivery', Attachment.owner_id==DeliveryRecord.id)", foreign_keys="Attachment.owner_id", cascade="all, delete-orphan", overlaps="attachments")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    kind = Column(SAEnum(PaymentKind), nullable=False, default=PaymentKind.project)
    installment_number = Column(Integer, nullable=True)
    method = Column(SAEnum(PaymentMethod), nullable=True)
    status = Column(SAEnum(PaymentStatus), default=PaymentStatus.pendiente, nullable=False)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    project = relationship("Project", back_populates="payments")
    receipts = relationship("Attachment", primaryjoin="and_(Attachment.owner_type=='payment_receipt', Attachment.owner_id==Payment.id)", foreign_keys="Attachment.owner_id", cascade="all, delete-orphan", overlaps="attachments")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    kind = Column(SAEnum(NotificationKind), nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)
    read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User")


class DigitalCard(Base):
    __tablename__ = "digital_cards"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    event_type = Column(SAEnum(CardEventType), nullable=False, default=CardEventType.otro)
    event_date = Column(String(50), nullable=True)  # stored as ISO string, flexible
    chosen_design = Column(String(255), nullable=True)  # design slug/name from catalog
    description = Column(Text, nullable=False, default="")
    status = Column(SAEnum(CardStatus), default=CardStatus.pendiente, nullable=False, index=True)
    admin_price = Column(Integer, nullable=True)
    link_entrega = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    client = relationship("User", back_populates="cards", foreign_keys=[client_id])
    messages = relationship("CardMessage", back_populates="card", cascade="all, delete-orphan")


class CardCategory(Base):
    __tablename__ = "card_categories"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False, default="")
    order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    designs = relationship("CardDesign", back_populates="category", cascade="all, delete-orphan")


class CardDesign(Base):
    """Tarjeta digital real (invitación desplegada) que se muestra en el catálogo público."""
    __tablename__ = "card_designs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("card_categories.id"), nullable=False, index=True)
    tag = Column(String(50), nullable=True)  # Popular, Nuevo, etc. (creable)
    discount_label = Column(String(100), nullable=True)  # tira de descuento/promo (ej: "-20% NAVIDAD")
    demo_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)  # preview de la invitación
    order = Column(Integer, default=0, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    category = relationship("CardCategory", back_populates="designs")


class FinanceEntry(Base):
    __tablename__ = "finance_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    description = Column(String(255), nullable=False)
    income = Column(Integer, nullable=True, default=None)
    expense = Column(Integer, nullable=True, default=None)
    source_payment_id = Column(Integer, nullable=True, index=True)  # si fue auto-generado por un pago confirmado
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class CardMessage(Base):
    __tablename__ = "card_messages"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("digital_cards.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    card = relationship("DigitalCard", back_populates="messages")
    sender = relationship("User")
    attachments = relationship("Attachment", primaryjoin="and_(Attachment.owner_type=='card_message', Attachment.owner_id==CardMessage.id)", foreign_keys="Attachment.owner_id", cascade="all, delete-orphan", overlaps="attachments")


class FormQuestion(Base):
    """Pregunta del formulario de pedido de tarjetas digitales (configurable por admin).

    Las 5 preguntas por defecto tienen un rol fijo (title/description/reference/detail/images)
    que alimenta el autocompletado del proyecto y el chat inicial; el admin puede editar su
    texto, ocultarlas y reordenarlas. Las preguntas personalizadas creadas por el admin no
    tienen rol y se muestran en el modal con su field_type elegido.
    """
    __tablename__ = "form_questions"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(SAEnum(FormQuestionRole), nullable=True)  # None = pregunta personalizada
    field_type = Column(SAEnum(FormQuestionFieldType), nullable=False, default=FormQuestionFieldType.text)
    text = Column(Text, nullable=False)
    order = Column(Integer, default=0, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class PortfolioItem(Base):
    """Trabajo/demo realizado que se muestra en /soluciones-web (gestionado por admin)."""
    __tablename__ = "portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    site_url = Column(String(500), nullable=False)
    image_url = Column(String(500), nullable=True)  # screenshot/preview de la demo
    order = Column(Integer, default=0, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)


class MonthlyExpense(Base):
    """Gasto fijo mensual (hosting, dominio, etc.) registrado por admin."""
    __tablename__ = "monthly_expenses"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(255), nullable=False)
    amount = Column(Integer, nullable=False)
    payment_date = Column(String(10), nullable=False)  # YYYY-MM-DD
    month_key = Column(String(7), nullable=False, index=True)  # YYYY-MM
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class AuthCode(Base):
    """Códigos de verificación de email y de restablecimiento de contraseña (guardados hasheados)."""
    __tablename__ = "auth_codes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    purpose = Column(SAEnum(AuthCodePurpose), nullable=False)
    code_hash = Column(String(64), nullable=False)  # sha256 hex del código
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="auth_codes")


class DeployedCard(Base):
    """Tarjeta estática desplegada desde un .ZIP (index.html + css/js/assets).

    Los archivos viven en <DEPLOY_DIR>/<slug>/ y se sirven en
    /tarjetas-digitales/<slug>. Borrar la fila + la carpeta libera el espacio
    cuando el evento del cliente termina.
    """
    __tablename__ = "deployed_cards"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    source_filename = Column(String(255), nullable=False, default="")
    deployed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    # Dueño (cliente) de la tarjeta: ve sus respuestas y edita su config
    client_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    # Config editable (ej: {"menu_options": ["Normal", "Veggie"]}) que la
    # tarjeta lee vía /api/public/tarjetas/{slug}/config
    config = Column(JSON, default=dict, nullable=False)
    # Si es False, el endpoint público de respuestas rechaza envíos
    submissions_open = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    deployer = relationship("User", foreign_keys=[deployed_by])
    client = relationship("User", foreign_keys=[client_id])
    submissions = relationship("CardSubmission", back_populates="card", cascade="all, delete-orphan")


class CardSubmission(Base):
    """Respuesta de un invitado/visitante a una tarjeta dinámica
    (RSVP, canción, menú, mensaje...). El `kind` indica el tipo y el
    `payload` JSON lleva los datos libres de cada tarjeta."""
    __tablename__ = "card_submissions"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("deployed_cards.id"), nullable=False, index=True)
    kind = Column(String(50), nullable=False, index=True)
    payload = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    card = relationship("DeployedCard", back_populates="submissions")
