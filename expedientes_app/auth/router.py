from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.utils import crear_token, get_usuario_actual, verify_password
from database import get_db
from models import Usuario
from schemas import LoginRequest, TokenResponse, UsuarioOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(datos: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if not usuario or not usuario.activo or not verify_password(datos.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    token = crear_token(usuario.id)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UsuarioOut)
def me(usuario_actual: Usuario = Depends(get_usuario_actual)):
    return usuario_actual
