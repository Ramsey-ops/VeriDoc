from datetime import datetime
from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from .. import crud, schemas
from ..auth import get_current_employee
from ..config import settings
from ..database import get_db
from ..models import Employee
from ..utils import (
    build_document_path,
    build_signed_document_path,
    create_digital_signature,
    create_qr_code,
    embed_qr_code_in_pdf,
    ensure_storage_path,
)

router = APIRouter()

@router.post("/documents", response_model=schemas.DocumentRead)
async def generate_document(
    customer_name: str = Form(...),
    document_number: str = Form(...),
    document_type: str = Form(...),
    expiration_date: str | None = Form(None),
    uploaded_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    if Path(uploaded_file.filename or "").suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF documents can be authenticated and stamped with a QR code.",
        )

    document_id = str(uuid4())
    document_path = build_document_path(document_id, uploaded_file.filename)
    ensure_storage_path()

    with open(document_path, "wb") as out_file:
        content = await uploaded_file.read()
        out_file.write(content)

    qr_url = f"{settings.FRONTEND_PUBLIC_URL.rstrip('/')}/verify/{document_id}"
    qr_code_path = create_qr_code(document_id, qr_url)
    signature = create_digital_signature(document_id, customer_name, document_number, content)
    signed_document_path = build_signed_document_path(document_id)

    try:
        embed_qr_code_in_pdf(
            source_pdf_path=document_path,
            qr_code_path=qr_code_path,
            output_pdf_path=signed_document_path,
            document_id=document_id,
            document_number=document_number,
            digital_signature=signature,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to stamp uploaded PDF: {exc}",
        ) from exc

    expiration_value = None
    if expiration_date:
        try:
            expiration_value = datetime.fromisoformat(expiration_date)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid expiration date format")

    document = await crud.create_document(
        db,
        document_id=document_id,
        customer_name=customer_name,
        document_number=document_number,
        document_type=document_type,
        file_path=document_path,
        signed_file_path=signed_document_path,
        qr_code_path=qr_code_path,
        uploaded_by_id=current_employee.id,
        digital_signature=signature,
        expiration_date=expiration_value,
    )
    await crud.create_audit_log(
        db,
        document_id=document.id,
        employee_id=current_employee.id,
        event_type="document_generated",
        status="success",
        message="Document generated, QR stamped, and stored.",
    )
    return schemas.DocumentRead.model_validate(document).model_copy(
        update={"download_url": f"{settings.API_V1_STR}/documents/{document.document_id}/download"}
    )


@router.get("/documents/{document_id}/download")
async def download_generated_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    _: Employee = Depends(get_current_employee),
):
    document = await crud.get_document_by_document_id(db, document_id)
    if not document or not document.signed_file_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generated document not found")

    signed_path = Path(document.signed_file_path)
    if not signed_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generated document file not found")

    return FileResponse(
        signed_path,
        media_type="application/pdf",
        filename=f"veridoc_{document.document_number}.pdf",
    )
