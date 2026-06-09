# VeriDoc Project Report Source Document

Prepared for: Union Bank of Cameroon document authentication project  
Project name: VeriDoc  
Stack: FastAPI, React, Tailwind CSS, Framer Motion, PostgreSQL, Docker  
Date prepared: 2026-06-09

---

## 1. Purpose of This Document

This Markdown file is a complete report-source document for the VeriDoc project. It records the important steps taken from the beginning of the implementation to the current working system, including the tools used, architectural decisions, backend and frontend modules, testing approach, functional and non-functional requirements, limitations, estimated implementation cost in FCFA, and a source-code inventory.

This file is designed so that another AI, supervisor, lecturer, or developer can understand the project quickly and use it to generate a formal academic or professional report.

Generated/vendor files are intentionally not reproduced in full:

- `frontend/node_modules/`
- `frontend/dist/`
- `storage/`
- `__pycache__/`
- real `.env` secrets
- `frontend/package-lock.json` full lock content

These are excluded because they are generated, environment-specific, binary, sensitive, or too large for a useful report appendix. The source files and configuration needed to understand the system are documented below.

---

## 2. Executive Summary

VeriDoc is a QR Code-Based Document Authentication and Verification Platform designed for Union Bank of Cameroon. The system allows authorized bank employees to upload official PDF documents, generate a unique QR code, embed the QR code into the PDF, digitally sign the document, store the document record in PostgreSQL, and provide a public verification portal where customers can scan the QR code and view the authentic softcopy of the original verified document.

The system contains:

- Employee authentication
- Admin-only user management
- PDF upload and QR stamping
- Digital signature verification
- Public document verification portal
- Document repository
- Audit logs
- Analytics dashboard
- Dockerized backend and PostgreSQL environment
- Premium React frontend with Tailwind CSS and Framer Motion

---

## 3. Project Problem Statement

Banks often issue official documents such as bank statements, transaction receipts, financial certificates, and loan approval letters. These documents may be forged, edited, or copied by unauthorized people. Traditional QR systems often only open a webpage and do not prove that the displayed document is the original bank-issued softcopy.

VeriDoc solves this by linking each generated document to:

- an authenticated employee,
- a stored original PDF,
- a unique QR identifier,
- a cryptographic signature,
- a verification endpoint,
- and an audit log.

When a customer scans the QR code, they are taken to the verification portal, where the system displays the authentic softcopy of the document for comparison with the physical or downloaded document in hand.

---

## 4. Departments That Can Use VeriDoc

The platform can be useful to several departments in a bank:

1. Customer Service Department  
   Can generate verified customer-facing documents such as account confirmation letters and service request responses.

2. Operations Department  
   Can issue transaction confirmations, internal approvals, and branch-generated official records.

3. Credit and Loan Department  
   Can issue loan approval letters, repayment schedules, financial standing certificates, and credit-related documents.

4. Compliance and Risk Department  
   Can track verification attempts, detect suspicious document verification behavior, and audit document access.

5. Internal Audit Department  
   Can review which employee generated a document, when it was generated, and how often it was verified.

6. Corporate Banking Department  
   Can issue verified statements, certificates, or letters to business clients.

7. Digital Banking / IT Department  
   Can maintain the platform, deploy it, manage system security, and integrate it with future bank infrastructure.

8. Branch Administration  
   Can supervise branch-level employee document generation and ensure accountability.

---

## 5. Project Scope

### 5.1 In Scope

- Employee login.
- Admin login through the same login form using role-based access.
- Admin user management.
- Automatic employee ID generation using the format `UBC-EMP-000001`.
- PDF document upload.
- QR code generation.
- QR code embedding at the bottom-right of the PDF.
- Digital signature generation and verification.
- Verified PDF download by authenticated employee.
- Public verification portal for customers.
- Inline PDF display on the verification page.
- Document repository dashboard.
- Audit dashboard.
- Analytics dashboard.
- Docker-based local development.
- PostgreSQL persistence.

### 5.2 Important Scope Rule

The document to be authenticated must be a PDF.

This rule is important because VeriDoc embeds the QR code directly into the PDF using PDF manipulation libraries. Other document formats such as `.docx`, `.png`, `.jpg`, or `.xlsx` are outside the current system scope.

### 5.3 Out of Scope for Current Version

- OCR comparison between printed paper and scanned document.
- Blockchain notarization.
- Integration with core banking systems.
- Enterprise single sign-on.
- Multi-branch tenant separation.
- Advanced document templates.
- SMS/email notification.
- Mobile app.

---

## 6. Methodology Used

The project followed an Agile-inspired incremental methodology.

### Why Agile Was Suitable

The system was developed in stages:

1. Backend environment setup.
2. Database models.
3. Authentication.
4. Document upload.
5. QR generation.
6. PDF stamping.
7. Verification endpoint.
8. Admin dashboards.
9. Premium React frontend.
10. Frontend-backend integration.
11. Local network QR testing.
12. Refinements such as automatic employee IDs and authenticated downloads.

This kind of project benefits from Agile because features can be built and tested step by step. The system started as a backend foundation, then expanded into a full product interface after the backend workflow was stable.

### Iterations Used

- Iteration 1: Backend foundation and Docker/PostgreSQL setup.
- Iteration 2: Authentication, employee table, document table, audit table.
- Iteration 3: Document upload and QR code generation.
- Iteration 4: PDF stamping and verified PDF download.
- Iteration 5: Customer verification portal.
- Iteration 6: Admin dashboard and user management.
- Iteration 7: Local network testing using phone QR scan.
- Iteration 8: Bug fixing and usability improvements.

---

## 7. Tools and Technologies Used

### Backend

- Python
- FastAPI
- SQLAlchemy
- AsyncPG
- PostgreSQL
- Alembic
- Python-JOSE for JWT
- Passlib for password hashing
- QRCode library
- Pillow
- PyPDF
- ReportLab

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Lucide React icons

### DevOps and Environment

- Docker
- Docker Compose
- VS Code terminal
- PowerShell
- Local Wi-Fi/LAN testing

### Testing and Validation Tools

- Browser testing
- Phone QR scanning
- PowerShell `Invoke-RestMethod`
- PowerShell `Invoke-WebRequest`
- Docker logs
- Docker container health checks
- Vite production build

---

## 8. System Architecture

### 8.1 High-Level Architecture

```text
React Frontend
    |
    | HTTP/JSON + PDF response
    v
FastAPI Backend
    |
    | SQLAlchemy async
    v
PostgreSQL Database
    |
    v
Local Storage Folder for PDFs and QR Images
```

### 8.2 Main Runtime Components

1. Frontend client  
   Runs on Vite during development at `http://172.20.10.3:5173`.

2. Backend API  
   Runs in Docker at `http://172.20.10.3:8000`.

3. PostgreSQL database  
   Runs in Docker as `veridoc-db`.

4. Storage directory  
   Stores uploaded PDFs, generated QR images, and final verified PDFs.

---

## 9. Main Workflow

### 9.1 Employee Document Generation Workflow

```text
Landing Page
  -> Login Page
  -> Generate Document Page
  -> Upload PDF
  -> Backend stores original PDF
  -> Backend generates document ID
  -> Backend creates QR code
  -> Backend generates digital signature
  -> Backend embeds QR stamp into PDF
  -> Backend stores final verified PDF
  -> Employee downloads verified PDF
  -> Employee gives PDF to customer
```

### 9.2 Customer Verification Workflow

```text
Customer scans QR code
  -> Phone opens React verification page
  -> Frontend calls backend verification API
  -> Backend checks document record
  -> Backend checks expiration
  -> Backend checks digital signature
  -> Frontend displays Authentic / Invalid result
  -> Frontend displays official PDF inline
```

### 9.3 Admin Workflow

```text
Admin logs in
  -> Opens /admin
  -> Views analytics
  -> Creates employees
  -> Edits employee role/status
  -> Views document repository
  -> Views audit logs
```

---

## 10. Functional Requirements

1. The system shall display a landing page.
2. The system shall allow employees to log in.
3. The system shall authenticate employees using username and password.
4. The system shall store passwords as hashes.
5. The system shall support role-based access control.
6. The system shall allow admins to create employees.
7. The system shall automatically generate employee IDs.
8. The system shall allow admins to edit employee details.
9. The system shall allow admins to disable employees.
10. The system shall allow admins to delete employees.
11. The system shall allow authenticated employees to upload PDF documents.
12. The system shall generate a unique document ID.
13. The system shall generate a QR code for each document.
14. The system shall embed the QR code into the PDF.
15. The system shall create a digital signature for each document.
16. The system shall store document metadata in PostgreSQL.
17. The system shall store uploaded and verified PDF files.
18. The system shall allow employees to download the verified PDF.
19. The system shall provide a public verification page.
20. The system shall show the authentic document softcopy inline on verification.
21. The system shall record audit logs for verification attempts.
22. The system shall show analytics for uploaded and verified documents.

---

## 11. Non-Functional Requirements

1. Security  
   JWT authentication, password hashing, and role-based admin protection.

2. Usability  
   Clean React interface with clear workflow.

3. Performance  
   Fast API responses and efficient local PDF processing.

4. Maintainability  
   Modular backend route files and reusable frontend components.

5. Scalability  
   PostgreSQL and Docker-based deployment allow future scaling.

6. Reliability  
   Document metadata and audit logs persist in PostgreSQL.

7. Accessibility  
   Semantic controls, clear labels, readable contrast, responsive layout.

8. Portability  
   Docker Compose allows setup on another machine with fewer manual steps.

9. Auditability  
   Generated documents and verification attempts are traceable.

10. Responsiveness  
   Frontend is mobile-first and can be used from phones for verification.

---

## 12. Limitations

The following are project limitations that are not based on cost or internet connection:

1. Only PDF files are supported in the current version.
2. The system does not currently perform OCR to compare a photographed paper document with the stored PDF.
3. The verification system proves the stored PDF authenticity, but it does not inspect physical paper damage or print quality.
4. The current version uses local file storage; a production version should use managed object storage.
5. The current version does not include enterprise SSO or biometric authentication.
6. The current version does not include multi-branch tenant isolation.
7. The current version does not include automatic email/SMS delivery of verified documents.
8. The current version does not include document template generation.
9. The current version does not include an approval workflow before document release.
10. The current version does not include advanced fraud scoring.

---

## 13. Cost Estimate in FCFA

The cost depends on whether the bank uses an internal team or an external contractor. A realistic start-to-usage estimate for a production-ready pilot is:

| Item | Estimated Cost FCFA |
|---|---:|
| Requirements analysis and project planning | 300,000 - 700,000 |
| Backend development | 900,000 - 1,800,000 |
| Frontend development | 800,000 - 1,600,000 |
| Database and deployment setup | 300,000 - 800,000 |
| Security hardening and testing | 400,000 - 1,000,000 |
| UI/UX refinement | 300,000 - 700,000 |
| Documentation and training | 200,000 - 500,000 |
| Initial hosting and domain setup | 100,000 - 300,000 |
| Contingency | 300,000 - 800,000 |

Estimated pilot total:

```text
3,600,000 FCFA to 8,200,000 FCFA
```

For a larger enterprise deployment with SSO, object storage, monitoring, backups, and bank infrastructure integration, the cost can exceed:

```text
10,000,000 FCFA to 25,000,000 FCFA
```

---

## 14. Code Tuning and Quality Improvements

Several code tuning decisions were made:

1. Modular backend routes  
   The backend was divided into route files: `auth.py`, `admin.py`, `documents.py`, `verification.py`, and `health.py`.

2. Reusable frontend components  
   Buttons, inputs, file upload, metric cards, skeletons, and layout shells were abstracted.

3. Automatic employee IDs  
   Admins no longer manually type IDs, reducing data inconsistency.

4. Authenticated download flow  
   PDF download uses `fetch` with JWT instead of a raw link.

5. Local network QR correction  
   QR codes were changed from `127.0.0.1` to the laptop LAN IP during development so phone scanning works.

6. Lazy PDF imports  
   PDF processing libraries are imported only when stamping is needed, preventing startup crashes if dependencies are temporarily unavailable.

7. Inline PDF display  
   Customer verification displays the softcopy in the browser, instead of forcing download.

---

## 15. Reducing Complexity

### 15.1 Through Abstraction

The project reduces complexity by abstracting repeated logic:

- API calls are centralized in `frontend/src/lib/api.js`.
- Motion settings are centralized in `frontend/src/lib/motion.js`.
- Authentication state is centralized in `AuthContext.jsx`.
- UI controls are reusable components.
- Backend database access is centralized in `crud.py`.
- Environment settings are centralized in `config.py`.

### 15.2 Through Modularization

The backend is split into:

- models
- schemas
- auth utilities
- database utilities
- CRUD helpers
- route modules

The frontend is split into:

- pages
- components
- context
- libraries
- styles

This makes the system easier to understand, test, and extend.

### 15.3 Avoiding Over-Abstraction

The project avoids over-complicating small features. For example, the PDF generation flow is kept in direct utility functions rather than creating unnecessary service classes too early.

---

## 16. Testing Approach

### 16.1 Manual Integration Testing Performed

The following flows were manually tested:

1. Backend health endpoint.
2. Admin login.
3. Employee creation.
4. Automatic employee ID generation.
5. PDF upload.
6. QR code generation.
7. Verified PDF download.
8. Phone QR scanning.
9. Public verification page.
10. Inline PDF display.
11. Admin dashboard analytics.
12. Audit logs.

### 16.2 Example Unit Test Explanation

A useful unit test target is the employee ID generator in `app/crud.py`.

Purpose:

To confirm that when a new employee is created, the system generates a unique ID in the expected format.

Expected behavior:

```text
First employee -> UBC-EMP-000001
Second employee -> UBC-EMP-000002
Third employee -> UBC-EMP-000003
```

Possible unit test:

```python
async def test_generate_employee_id_returns_next_standard_id(db_session):
    employee_id = await generate_employee_id(db_session)
    assert employee_id.startswith("UBC-EMP-")
    assert len(employee_id) == len("UBC-EMP-000001")
```

Why this is important:

Employee IDs are part of employee accountability. If this function fails, the admin dashboard may create duplicate or inconsistent employee records.

### 16.3 Frontend Component Test Example

A useful frontend component test target is the `Button` component.

Test goal:

- Confirm that when `loading=true`, the loading spinner appears.
- Confirm that the button becomes disabled.
- Confirm that normal button text still renders.

Reason:

The same button is used for login, document generation, and authenticated PDF download. A bug in this component can affect several workflows.

---

## 17. Screenshots Needed for Final Report

The following screenshots should be captured and saved in:

```text
docs/screenshots/
```

Recommended screenshot filenames:

1. `01_landing_page.png`  
   Shows the premium landing page.

2. `02_employee_login.png`  
   Shows the employee login form.

3. `03_generate_document.png`  
   Shows the employee PDF upload and QR generation page.

4. `04_verified_pdf_output.png`  
   Shows the downloaded PDF with QR stamp at the bottom-right.

5. `05_phone_qr_scan.png`  
   Shows the phone opening the verification portal.

6. `06_verification_portal.png`  
   Shows the customer verification page with Authentic status and inline PDF.

7. `07_admin_overview.png`  
   Shows admin analytics.

8. `08_user_management.png`  
   Shows admin user creation and generated employee ID list.

9. `09_document_dashboard.png`  
   Shows document repository.

10. `10_audit_dashboard.png`  
   Shows audit logs.

Markdown placeholders:

```markdown
![Landing Page](screenshots/01_landing_page.png)
![Employee Login](screenshots/02_employee_login.png)
![Generate Document](screenshots/03_generate_document.png)
![Verified PDF Output](screenshots/04_verified_pdf_output.png)
![Phone QR Scan](screenshots/05_phone_qr_scan.png)
![Verification Portal](screenshots/06_verification_portal.png)
![Admin Overview](screenshots/07_admin_overview.png)
![User Management](screenshots/08_user_management.png)
![Document Dashboard](screenshots/09_document_dashboard.png)
![Audit Dashboard](screenshots/10_audit_dashboard.png)
```

---

## 18. How to Run the System Locally

### 18.1 Start Backend and Database

```powershell
cd C:\Users\RAMSEY\Desktop\VeriDoc
docker compose up -d
```

### 18.2 Start Frontend

```powershell
cd C:\Users\RAMSEY\Desktop\VeriDoc\frontend
npm.cmd run dev
```

### 18.3 Open Application

```text
http://172.20.10.3:5173
```

### 18.4 Default Admin Credentials

```text
Username: admin
Password: admin123
Employee ID: UBC-EMP-000001
```

### 18.5 When to Use Build

Use this only after dependency or Docker changes:

```powershell
docker compose up --build -d
```

For normal daily startup:

```powershell
docker compose up -d
```

---

## 19. Repository File Inventory

Important source and configuration files:

```text
app/
  __init__.py
  auth.py
  config.py
  crud.py
  database.py
  main.py
  models.py
  schemas.py
  utils.py
  routes/
    __init__.py
    admin.py
    auth.py
    documents.py
    health.py
    verification.py

alembic/
  env.py
  versions/
    __init__.py

frontend/
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  vite.config.js
  .env.example
  src/
    App.jsx
    main.jsx
    styles.css
    components/
      AppShell.jsx
      Button.jsx
      FileDrop.jsx
      Input.jsx
      MetricCard.jsx
      Page.jsx
      Select.jsx
      Skeleton.jsx
    context/
      AuthContext.jsx
    lib/
      api.js
      motion.js
    pages/
      AdminDashboard.jsx
      GenerateDocument.jsx
      Landing.jsx
      Login.jsx
      VerificationPortal.jsx

Root files:
  .env.example
  alembic.ini
  docker-compose.yml
  Dockerfile
  README.md
  requirements.txt
```

---

## 20. Source File Roles

### Backend

| File | Purpose |
|---|---|
| `app/main.py` | Creates FastAPI app, CORS, route registration, startup database initialization. |
| `app/config.py` | Loads environment variables with Pydantic settings. |
| `app/database.py` | Creates async SQLAlchemy engine, sessions, startup table creation, admin seeding. |
| `app/models.py` | Defines Employee, Document, and AuditLog database tables. |
| `app/schemas.py` | Defines Pydantic request/response schemas. |
| `app/auth.py` | Password hashing, JWT creation/decoding, current-user and admin dependencies. |
| `app/crud.py` | Database helper functions, including employee ID generation. |
| `app/utils.py` | Storage helpers, QR generation, digital signatures, PDF stamping. |
| `app/routes/auth.py` | Login endpoint. |
| `app/routes/admin.py` | Admin employee management, documents, audit logs, analytics. |
| `app/routes/documents.py` | Authenticated PDF upload, QR stamping, verified PDF download. |
| `app/routes/verification.py` | Public document verification and inline PDF display. |
| `app/routes/health.py` | Health check endpoint. |

### Frontend

| File | Purpose |
|---|---|
| `frontend/src/App.jsx` | Main frontend routing and protected route logic. |
| `frontend/src/main.jsx` | React entry point. |
| `frontend/src/styles.css` | Tailwind setup and global styling. |
| `frontend/src/context/AuthContext.jsx` | Stores JWT and user role in localStorage. |
| `frontend/src/lib/api.js` | Central API helper functions. |
| `frontend/src/lib/motion.js` | Shared Framer Motion transitions. |
| `frontend/src/pages/Landing.jsx` | Landing page. |
| `frontend/src/pages/Login.jsx` | Employee/admin login. |
| `frontend/src/pages/GenerateDocument.jsx` | PDF upload and verified document generation. |
| `frontend/src/pages/AdminDashboard.jsx` | Admin dashboard, users, documents, audit logs. |
| `frontend/src/pages/VerificationPortal.jsx` | Public verification page with inline PDF. |
| `frontend/src/components/*` | Reusable UI components. |

---

## 21. Core Source Code Appendix

This appendix contains the most important project source code. For generated files such as `package-lock.json`, use the repository copy directly.

### 21.1 Backend Entry Point: `app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import init_db
from .routes import auth, documents, verification, admin, health

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}", tags=["Auth"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}", tags=["Documents"])
app.include_router(verification.router, prefix=f"{settings.API_V1_STR}", tags=["Verification"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}", tags=["Admin"])


@app.on_event("startup")
async def on_startup():
    await init_db()
```

### 21.2 Backend Models: `app/models.py`

```python
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(64), unique=True, nullable=False, index=True)
    full_name = Column(String(128), nullable=False)
    username = Column(String(64), unique=True, nullable=False, index=True)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(32), default="employee", nullable=False)
    is_active = Column(Boolean, default=True)
    date_created = Column(DateTime(timezone=True), server_default=func.now())

    documents = relationship("Document", back_populates="uploaded_by")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(128), unique=True, nullable=False, index=True)
    customer_name = Column(String(128), nullable=False)
    document_number = Column(String(128), nullable=False)
    document_type = Column(String(64), nullable=False)
    file_path = Column(String(512), nullable=False)
    signed_file_path = Column(String(512), nullable=True)
    qr_code_path = Column(String(512), nullable=True)
    digital_signature = Column(String(256), nullable=True)
    expiration_date = Column(DateTime(timezone=True), nullable=True)
    is_valid = Column(Boolean, default=True)
    date_uploaded = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by_id = Column(Integer, ForeignKey("employees.id"), nullable=False)

    uploaded_by = relationship("Employee", back_populates="documents")
    audit_logs = relationship("AuditLog", back_populates="document")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    event_type = Column(String(64), nullable=False)
    status = Column(String(64), nullable=False)
    message = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="audit_logs")
```

### 21.3 Employee ID Generation: `app/crud.py`

```python
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
```

### 21.4 PDF Stamping Concept: `app/utils.py`

```python
def embed_qr_code_in_pdf(
    *,
    source_pdf_path: str,
    qr_code_path: str,
    output_pdf_path: str,
    document_id: str,
    document_number: str,
    digital_signature: str,
) -> str:
    from pypdf import PdfReader, PdfWriter

    reader = PdfReader(source_pdf_path)
    writer = PdfWriter()

    if not reader.pages:
        raise ValueError("Uploaded PDF has no pages")

    last_page_index = len(reader.pages) - 1
    for index, page in enumerate(reader.pages):
        if index == last_page_index:
            width = float(page.mediabox.width)
            height = float(page.mediabox.height)
            overlay = _build_pdf_stamp(
                width=width,
                height=height,
                qr_code_path=qr_code_path,
                document_id=document_id,
                document_number=document_number,
                digital_signature=digital_signature,
            )
            page.merge_page(overlay)
        writer.add_page(page)

    with open(output_pdf_path, "wb") as output_file:
        writer.write(output_file)

    return output_pdf_path
```

### 21.5 Frontend Routing: `frontend/src/App.jsx`

```jsx
import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import GenerateDocument from "./pages/GenerateDocument.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import VerificationPortal from "./pages/VerificationPortal.jsx";

function ProtectedRoute({ children, adminOnly = false }) {
  const { token, userRole } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userRole !== "admin") {
    return <Navigate to="/generate" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/generate" element={<ProtectedRoute><GenerateDocument /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/verify/:documentId" element={<VerificationPortal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
```

### 21.6 API Helper Summary: `frontend/src/lib/api.js`

Important frontend API functions:

```javascript
loginEmployee(credentials)
generateDocument({ token, formData })
downloadGeneratedDocument({ token, path, filename })
verifyDocument(documentId)
getAdminAnalytics(token)
getAdminDocuments(token)
getAuditLogs(token)
getEmployees(token)
createEmployee({ token, employee })
updateEmployee({ token, id, employee })
deleteEmployee({ token, id })
apiUrl(path)
```

---

## 22. Configuration Summary

### 22.1 Backend `.env.example`

```env
APP_NAME=VeriDoc
API_V1_STR=/api/v1
SECRET_KEY=replace-with-a-secure-random-string
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=postgresql+asyncpg://veridoc_user:veridoc_password@db:5432/veridoc_db
STORAGE_PATH=./storage
PUBLIC_BASE_URL=http://172.20.10.3:8000
FRONTEND_PUBLIC_URL=http://172.20.10.3:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 22.2 Frontend `.env.example`

```env
VITE_API_BASE_URL=http://172.20.10.3:8000
```

---

## 23. Final Current Status

Current working features:

- Backend starts with Docker Compose.
- PostgreSQL runs in Docker.
- React frontend runs with Vite.
- Admin can log in.
- Admin can create users from the frontend.
- Employee IDs are generated automatically.
- Employees can upload PDF documents.
- The system generates a QR code.
- The QR code is embedded in the PDF.
- Employee can download the verified PDF.
- Customer can scan QR code.
- Verification portal displays authenticity result.
- Verification portal displays official PDF inline.
- Admin dashboard shows analytics, users, documents, and audit logs.

---

## 24. Recommended Future Improvements

1. Add formal automated backend tests with Pytest.
2. Add frontend component tests with Vitest and React Testing Library.
3. Replace local file storage with cloud object storage.
4. Add branch/department fields to employees.
5. Add approval workflow before document release.
6. Add document revocation feature.
7. Add email delivery.
8. Add production deployment on Railway or another platform.
9. Add HTTPS domain for QR scanning in production.
10. Add full audit export to CSV/PDF.

