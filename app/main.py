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
