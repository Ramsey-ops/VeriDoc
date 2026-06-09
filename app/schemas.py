from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: str
    role: str

class EmployeeCreate(BaseModel):
    full_name: str
    username: str
    password: str
    role: str = "employee"

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class EmployeeLogin(BaseModel):
    username: str
    password: str

class EmployeeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: str
    full_name: str
    username: str
    role: str
    is_active: bool
    date_created: datetime

class DocumentCreate(BaseModel):
    customer_name: str
    document_number: str
    document_type: str
    expiration_date: Optional[datetime]

class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    document_id: str
    customer_name: str
    document_number: str
    document_type: str
    file_path: str
    signed_file_path: Optional[str]
    qr_code_path: Optional[str]
    digital_signature: Optional[str]
    expiration_date: Optional[datetime]
    is_valid: bool
    date_uploaded: datetime
    uploaded_by_id: int
    download_url: Optional[str] = None

class VerificationRequest(BaseModel):
    document_id: str

class VerificationResult(BaseModel):
    document_id: str
    customer_name: str
    document_number: str
    document_type: str
    issue_date: datetime
    verification_status: str
    message: str
    document_url: str

class AuditLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    document_id: int
    employee_id: Optional[int]
    event_type: str
    status: str
    message: Optional[str]
    timestamp: datetime

class AnalyticsSummary(BaseModel):
    documents_uploaded: int
    documents_verified: int
    failed_verification_attempts: int
    todays_verifications: int
