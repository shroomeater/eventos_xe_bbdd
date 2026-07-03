from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from config import DIAS_HABILES_INCOMPLETO
from models import TurnoTecnico, Usuario


def dias_habiles_transcurridos(fecha_creacion: datetime | date) -> int:
    hoy = date.today()
    dias = 0
    actual = fecha_creacion.date() if hasattr(fecha_creacion, "date") else fecha_creacion
    while actual < hoy:
        actual += timedelta(days=1)
        if actual.weekday() < 5:  # 0=lunes, 4=viernes
            dias += 1
    return dias


def es_incompleto(expediente) -> bool:
    if expediente.fecha_inicio_evento and expediente.fecha_fin_evento:
        return False
    return dias_habiles_transcurridos(expediente.fecha_creacion) > DIAS_HABILES_INCOMPLETO


def preasignar_tecnico_juridico(db: Session) -> tuple[int | None, int | None]:
    hoy = date.today()
    turno = (
        db.query(TurnoTecnico)
        .filter(TurnoTecnico.semana_inicio <= hoy, TurnoTecnico.semana_fin >= hoy)
        .first()
    )
    tecnico_id = turno.usuario_id if turno else None

    juridico = (
        db.query(Usuario)
        .filter(
            Usuario.rol == "juridico",
            Usuario.juridico_defecto.is_(True),
            Usuario.activo.is_(True),
        )
        .first()
    )
    juridico_id = juridico.id if juridico else None

    return tecnico_id, juridico_id
