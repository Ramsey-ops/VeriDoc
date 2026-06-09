from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from .. import crud, schemas, models
from ..auth import get_password_hash
from ..auth import require_admin
from ..database import get_db

router = APIRouter()

@router.post("/admin/employees", response_model=schemas.EmployeeRead)
async def create_admin_employee(
    employee: schemas.EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    _: models.Employee = Depends(require_admin),
):
    existing = await crud.get_employee_by_username(db, username=employee.username)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    employee_id = await crud.generate_employee_id(db)
    return await crud.create_employee(
        db,
        full_name=employee.full_name,
        username=employee.username,
        employee_id=employee_id,
        password=employee.password,
        role=employee.role,
    )

@router.get("/admin/employees", response_model=List[schemas.EmployeeRead])
async def list_employees(
    db: AsyncSession = Depends(get_db),
    _: models.Employee = Depends(require_admin),
):
    result = await db.execute(select(models.Employee))
    return result.scalars().all()

@router.patch("/admin/employees/{employee_id}", response_model=schemas.EmployeeRead)
async def update_employee(
    employee_id: int,
    employee_update: schemas.EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: models.Employee = Depends(require_admin),
):
    employee = await db.get(models.Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    if employee_update.username and employee_update.username != employee.username:
        existing = await crud.get_employee_by_username(db, username=employee_update.username)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
        employee.username = employee_update.username

    if employee_update.full_name is not None:
        employee.full_name = employee_update.full_name
    if employee_update.password:
        employee.hashed_password = get_password_hash(employee_update.password)
    if employee_update.role is not None:
        employee.role = employee_update.role
    if employee_update.is_active is not None:
        if employee.id == current_admin.id and not employee_update.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot disable your own admin account")
        employee.is_active = employee_update.is_active

    await db.commit()
    await db.refresh(employee)
    return employee

@router.delete("/admin/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: models.Employee = Depends(require_admin),
):
    employee = await db.get(models.Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    if employee.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own admin account")

    await db.delete(employee)
    await db.commit()
    return None

@router.get("/admin/documents", response_model=List[schemas.DocumentRead])
async def list_documents(
    db: AsyncSession = Depends(get_db),
    _: models.Employee = Depends(require_admin),
):
    result = await db.execute(select(models.Document).order_by(models.Document.date_uploaded.desc()))
    return result.scalars().all()

@router.get("/admin/audit-logs", response_model=List[schemas.AuditLogRead])
async def list_audit_logs(
    db: AsyncSession = Depends(get_db),
    _: models.Employee = Depends(require_admin),
):
    result = await db.execute(select(models.AuditLog).order_by(models.AuditLog.timestamp.desc()))
    return result.scalars().all()

@router.get("/admin/analytics", response_model=schemas.AnalyticsSummary)
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    _: models.Employee = Depends(require_admin),
):
    documents_uploaded = await db.scalar(select(func.count(models.Document.id)))
    documents_verified = await db.scalar(
        select(func.count(models.AuditLog.id)).where(
            models.AuditLog.event_type == "verification_attempt",
            models.AuditLog.status == "success",
        )
    )
    failed_verification_attempts = await db.scalar(
        select(func.count(models.AuditLog.id)).where(
            models.AuditLog.event_type == "verification_attempt",
            models.AuditLog.status != "success",
        )
    )
    todays_verifications = await db.scalar(
        select(func.count(models.AuditLog.id)).where(
            models.AuditLog.event_type == "verification_attempt",
            func.date(models.AuditLog.timestamp) == func.current_date(),
        )
    )
    return schemas.AnalyticsSummary(
        documents_uploaded=documents_uploaded or 0,
        documents_verified=documents_verified or 0,
        failed_verification_attempts=failed_verification_attempts or 0,
        todays_verifications=todays_verifications or 0,
    )
