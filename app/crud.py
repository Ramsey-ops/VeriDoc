from datetime import datetime
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from . import models
from .auth import get_password_hash, verify_password

async def get_employee_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(models.Employee).where(models.Employee.username == username))
    return result.scalars().first()

async def get_employee_by_employee_id(db: AsyncSession, employee_id: str):
    result = await db.execute(select(models.Employee).where(models.Employee.employee_id == employee_id))
    return result.scalars().first()

async def generate_employee_id(db: AsyncSession) -> str:
    count = await db.scalar(
        select(func.count(models.Employee.id)).where(models.Employee.employee_id.like("UBC-EMP-%"))
    )
    next_number = (count or 0) + 1

    while True:
        employee_id = f"UBC-EMP-{next_number:06d}"
        existing = await get_employee_by_employee_id(db, employee_id)
        if not existing:
            return employee_id
        next_number += 1

async def create_employee(db: AsyncSession, *, full_name: str, username: str, employee_id: str, password: str, role: str = "employee"):
    employee = models.Employee(
        full_name=full_name,
        username=username,
        employee_id=employee_id,
        hashed_password=get_password_hash(password),
        role=role,
    )
    db.add(employee)
    await db.commit()
    await db.refresh(employee)
    return employee

async def authenticate_employee(db: AsyncSession, username: str, password: str):
    employee = await get_employee_by_username(db, username)
    if not employee or not verify_password(password, employee.hashed_password):
        return None
    return employee

async def create_document(db: AsyncSession, *, document_id: str, customer_name: str, document_number: str, document_type: str, file_path: str, signed_file_path: str, qr_code_path: str, uploaded_by_id: int, digital_signature: str = None, expiration_date: datetime = None):
    document = models.Document(
        document_id=document_id,
        customer_name=customer_name,
        document_number=document_number,
        document_type=document_type,
        file_path=file_path,
        signed_file_path=signed_file_path,
        qr_code_path=qr_code_path,
        digital_signature=digital_signature,
        expiration_date=expiration_date,
        uploaded_by_id=uploaded_by_id,
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    return document

async def get_document_by_document_id(db: AsyncSession, document_id: str):
    result = await db.execute(select(models.Document).where(models.Document.document_id == document_id))
    return result.scalars().first()

async def create_audit_log(db: AsyncSession, *, document_id: int, employee_id: int | None, event_type: str, status: str, message: str = None):
    audit_record = models.AuditLog(
        document_id=document_id,
        employee_id=employee_id,
        event_type=event_type,
        status=status,
        message=message,
    )
    db.add(audit_record)
    await db.commit()
    await db.refresh(audit_record)
    return audit_record
