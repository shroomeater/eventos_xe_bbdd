from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from auth.router import router as auth_router
from routers.expedientes import agenda_router
from routers.expedientes import router as expedientes_router
from routers.importacion import router as importacion_router
from routers.turnos import router as turnos_router
from routers.usuarios import router as usuarios_router

app = FastAPI(title="Control de expedientes — Espectáculos Públicos")

app.include_router(auth_router)
app.include_router(expedientes_router)
app.include_router(agenda_router)
app.include_router(usuarios_router)
app.include_router(turnos_router)
app.include_router(importacion_router)

FRONTEND_DIR = Path(__file__).resolve().parent / "frontend"
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
