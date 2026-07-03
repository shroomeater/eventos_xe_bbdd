from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.utils import get_usuario_actual
from database import get_db
from models import TurnoTecnico, Usuario
from schemas import TurnoCreate, TurnoOut

router = APIRouter(prefix="/turnos", tags=["turnos"])


@router.get("", response_model=list[TurnoOut])
def listar_turnos(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    return db.query(TurnoTecnico).order_by(TurnoTecnico.semana_inicio.asc()).all()


@router.post("", response_model=TurnoOut, status_code=201)
def crear_turno(
    datos: TurnoCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    turno = TurnoTecnico(**datos.model_dump())
    db.add(turno)
    db.commit()
    db.refresh(turno)
    return turno


@router.delete("/{turno_id}", status_code=204)
def eliminar_turno(
    turno_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    turno = db.get(TurnoTecnico, turno_id)
    if not turno:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    db.delete(turno)
    db.commit()
