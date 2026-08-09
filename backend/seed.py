"""Seed script: creates admin user, demo client, and base services."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from backend.app.core.database import SessionLocal, engine, Base
from backend.app.core.security import hash_password
from backend.app.models.models import User, Service, UserRole

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        # Admin
        existing_admin = db.query(User).filter(User.email == "nahueltisera03@gmail.com").first()
        if not existing_admin:
            admin = User(
                name="Nahuel Tisera",
                email="nahueltisera03@gmail.com",
                password_hash=hash_password("admin123"),
                role=UserRole.admin,
                email_verified=True,
            )
            db.add(admin)
            print("Admin creado: nahueltisera03@gmail.com / admin123")
        else:
            print("Admin ya existe")

        # Demo client
        existing_client = db.query(User).filter(User.email == "lucia@example.com").first()
        if not existing_client:
            client = User(
                name="Lucía Martínez",
                email="lucia@example.com",
                password_hash=hash_password("cliente123"),
                role=UserRole.client,
                email_verified=True,
            )
            db.add(client)
            print("Cliente demo creado: lucia@example.com / cliente123")
        else:
            print("Cliente demo ya existe")

        # Services
        services_data = [
            {"name": "Tarjetas Digitales", "slug": "tarjetas-digitales", "description": "Invitaciones digitales interactivas para eventos: casamientos, XV, cumpleaños, bautismos y más.", "base_price": 0, "features": ["Diseño 100% personalizado", "Fotos, fechas y datos del evento", "Música y animaciones", "Entrega con link propio"], "icon": "CreditCard", "order": 1, "supports_maintenance": False},
            {"name": "Pasarela de pagos", "slug": "pasarela-de-pagos", "description": "Integración de pasarela de pagos para tu negocio.", "base_price": 150000, "features": ["Integración con Mercado Pago", "Webhook de confirmación", "Panel de transacciones"], "icon": "CreditCard", "order": 2, "supports_maintenance": False},
            {"name": "Páginas Web", "slug": "paginas-web", "description": "Sitio web profesional y moderno para tu marca.", "base_price": 250000, "features": ["Diseño responsivo", "SEO básico", "Formulario de contacto", "Hosting 1 año"], "icon": "Globe", "order": 3, "supports_maintenance": True},
            {"name": "Sistemas Web", "slug": "sistemas-web", "description": "Sistema web a medida para gestionar tu negocio.", "base_price": 500000, "features": ["Panel de administración", "Base de datos", "Autenticación", "API REST"], "icon": "Monitor", "order": 4, "supports_maintenance": True},
            {"name": "Base de datos", "slug": "base-de-datos", "description": "Diseño e implementación de base de datos.", "base_price": 100000, "features": ["Modelado entidad-relación", "Consultas optimizadas", "Migraciones"], "icon": "Database", "order": 5, "supports_maintenance": False},
            {"name": "Sistemas con IA", "slug": "sistemas-con-ia", "description": "Sistemas potenciados con inteligencia artificial.", "base_price": 800000, "features": ["Modelos de IA", "API de inferencia", "Entrenamiento personalizado"], "icon": "Brain", "order": 6, "supports_maintenance": True},
            {"name": "Mantenimiento", "slug": "mantenimiento", "description": "Servicio de mantenimiento mensual.", "base_price": 50000, "features": ["Actualizaciones", "Soporte técnico", "Backups semanales"], "icon": "Wrench", "order": 7, "active": False, "supports_maintenance": False},
        ]

        for svc_data in services_data:
            existing = db.query(Service).filter(Service.slug == svc_data["slug"]).first()
            if not existing:
                svc = Service(**svc_data)
                db.add(svc)
                print(f"Servicio creado: {svc_data['name']}")
            else:
                print(f"Servicio ya existe: {svc_data['name']}")

        db.commit()
        print("\nSeed completado exitosamente.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
