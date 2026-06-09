import asyncio
from sqlalchemy.exc import OperationalError
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import settings

DATABASE_URL = settings.DATABASE_URL

engine: AsyncEngine = create_async_engine(DATABASE_URL, future=True, echo=False)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
Base = declarative_base()

async def init_db(retries: int = 10, delay: int = 3) -> None:
    from .models import Employee, Document, AuditLog

    for attempt in range(1, retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                await ensure_schema_updates(conn)
            await seed_default_admin()
            return
        except OperationalError:
            if attempt == retries:
                raise
            await asyncio.sleep(delay)

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

async def ensure_schema_updates(conn) -> None:
    await conn.execute(
        text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS signed_file_path VARCHAR(512)")
    )

async def seed_default_admin() -> None:
    from . import crud

    async with AsyncSessionLocal() as session:
        existing = await crud.get_employee_by_username(session, settings.ADMIN_USERNAME)
        if existing:
            if existing.employee_id == "ADMIN-001":
                replacement_id = "UBC-EMP-000001"
                id_owner = await crud.get_employee_by_employee_id(session, replacement_id)
                if not id_owner or id_owner.id == existing.id:
                    existing.employee_id = replacement_id
                    await session.commit()
            return

        await crud.create_employee(
            session,
            full_name="System Administrator",
            username=settings.ADMIN_USERNAME,
            employee_id="UBC-EMP-000001",
            password=settings.ADMIN_PASSWORD,
            role="admin",
        )
