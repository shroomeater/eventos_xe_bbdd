from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from auth.utils import get_usuario_actual
from database import get_db
from logica import es_incompleto, preasignar_tecnico_juridico
from models import Expediente, FaseHistorico, Usuario
from schemas import (
    ExpedienteCreate,
    ExpedienteListOut,
    ExpedienteOut,
    ExpedienteUpdate,
    FaseHistoricoOut,
)

router = APIRouter(tags=["expedientes"])


def _con_incompleto(exp: Expediente) -> ExpedienteListOut:
    salida = ExpedienteListOut.model_validate(exp)
    salida.incompleto = es_incompleto(exp)
    return salida


@router.get("/expedientes", response_model=list[ExpedienteListOut])
def listar_expedientes(
    fase: str | None = None,
    documentacion_pendiente: str | None = None,
    incompletos: bool | None = None,
    tecnico_id: int | None = None,
    juridico_id: int | None = None,
    texto: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    query = db.query(Expediente)

    if fase:
        query = query.filter(Expediente.fase == fase)
    if documentacion_pendiente:
        query = query.filter(Expediente.documentacion_pendiente == documentacion_pendiente)
    if tecnico_id is not None:
        query = query.filter(Expediente.tecnico_asignado_id == tecnico_id)
    if juridico_id is not None:
        query = query.filter(Expediente.juridico_asignado_id == juridico_id)
    if texto:
        patron = f"%{texto}%"
        query = query.filter(
            or_(Expediente.expediente.ilike(patron), Expediente.asunto.ilike(patron))
        )

    query = query.order_by(Expediente.fecha_inicio_evento.asc().nulls_first())

    expedientes = query.offset(skip).limit(limit).all()
    resultado = [_con_incompleto(e) for e in expedientes]

    if incompletos is not None:
        resultado = [e for e in resultado if e.incompleto == incompletos]

    return resultado


@router.get("/expedientes/{expediente_id}", response_model=ExpedienteOut)
def obtener_expediente(
    expediente_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    exp = db.get(Expediente, expediente_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    return _con_incompleto(exp)


@router.post("/expedientes", response_model=ExpedienteOut, status_code=201)
def crear_expediente(
    datos: ExpedienteCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    existente = db.query(Expediente).filter(Expediente.expediente == datos.expediente).first()
    if existente:
        raise HTTPException(status_code=409, detail="Ya existe un expediente con ese número")

    exp = Expediente(**datos.model_dump())

    if exp.tecnico_asignado_id is None and exp.juridico_asignado_id is None:
        tecnico_id, juridico_id = preasignar_tecnico_juridico(db)
        exp.tecnico_asignado_id = tecnico_id
        exp.juridico_asignado_id = juridico_id

    db.add(exp)
    db.commit()
    db.refresh(exp)
    return _con_incompleto(exp)


@router.patch("/expedientes/{expediente_id}", response_model=ExpedienteOut)
def actualizar_expediente(
    expediente_id: int,
    datos: ExpedienteUpdate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    exp = db.get(Expediente, expediente_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")

    cambios = datos.model_dump(exclude_unset=True)

    fase_anterior = exp.fase
    documentacion_anterior = exp.documentacion_pendiente

    for campo, valor in cambios.items():
        setattr(exp, campo, valor)

    fase_cambio = "fase" in cambios and cambios["fase"] != fase_anterior
    doc_cambio = (
        "documentacion_pendiente" in cambios
        and cambios["documentacion_pendiente"] != documentacion_anterior
    )

    if fase_cambio or doc_cambio:
        historico = FaseHistorico(
            expediente_id=exp.id,
            usuario_id=usuario_actual.id,
            fase_anterior=fase_anterior if fase_cambio else None,
            fase_nueva=exp.fase if fase_cambio else None,
            documentacion_anterior=documentacion_anterior if doc_cambio else None,
            documentacion_nueva=exp.documentacion_pendiente if doc_cambio else None,
        )
        db.add(historico)

    db.commit()
    db.refresh(exp)
    return _con_incompleto(exp)


@router.get("/expedientes/{expediente_id}/historico", response_model=list[FaseHistoricoOut])
def historico_expediente(
    expediente_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    exp = db.get(Expediente, expediente_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")

    return (
        db.query(FaseHistorico)
        .filter(FaseHistorico.expediente_id == expediente_id)
        .order_by(FaseHistorico.fecha_cambio.asc())
        .all()
    )


agenda_router = APIRouter(tags=["agenda"])


@agenda_router.get("/agenda", response_model=list[ExpedienteListOut])
def agenda(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    hoy = date.today()
    limite = hoy + timedelta(days=90)
    expedientes = (
        db.query(Expediente)
        .filter(
            Expediente.fecha_inicio_evento.isnot(None),
            Expediente.fecha_inicio_evento >= hoy,
            Expediente.fecha_inicio_evento <= limite,
        )
        .order_by(Expediente.fecha_inicio_evento.asc())
        .all()
    )
    return [_con_incompleto(e) for e in expedientes]
