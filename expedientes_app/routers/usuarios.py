from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.utils import get_usuario_actual, hash_password
from database import get_db
from models import Usuario
from schemas import UsuarioCreate, UsuarioOut, UsuarioUpdate

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("", response_model=list[UsuarioOut])
def listar_usuarios(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    return db.query(Usuario).filter(Usuario.activo.is_(True)).all()


@router.post("", response_model=UsuarioOut, status_code=201)
def crear_usuario(
    datos: UsuarioCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    if usuario_actual.rol != "administrativo":
        raise HTTPException(status_code=403, detail="Solo un administrativo puede crear usuarios")

    existente = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if existente:
        raise HTTPException(status_code=409, detail="Ya existe un usuario con ese email")

    if datos.juridico_defecto:
        db.query(Usuario).filter(Usuario.juridico_defecto.is_(True)).update(
            {"juridico_defecto": False}
        )

    usuario = Usuario(
        nombre=datos.nombre,
        email=datos.email,
        password_hash=hash_password(datos.password),
        rol=datos.rol,
        juridico_defecto=datos.juridico_defecto,
        activo=datos.activo,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.patch("/{usuario_id}", response_model=UsuarioOut)
def actualizar_usuario(
    usuario_id: int,
    datos: UsuarioUpdate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    cambios = datos.model_dump(exclude_unset=True)
    password = cambios.pop("password", None)

    if cambios.get("juridico_defecto"):
        db.query(Usuario).filter(Usuario.juridico_defecto.is_(True)).update(
            {"juridico_defecto": False}
        )

    for campo, valor in cambios.items():
        setattr(usuario, campo, valor)

    if password:
        usuario.password_hash = hash_password(password)

    db.commit()
    db.refresh(usuario)
    return usuario
