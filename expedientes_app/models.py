from datetime import datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

# Valores válidos para el campo `fase` de `expedientes`.
FASES_VALIDAS = [
    "Sin revisar",
    "Revisado administrativamente",
    "Pendiente revision tecnica",
    "Revision tecnica favorable",
    "Pendiente revision juridica",
    "Revision juridica favorable",
    "Preparada resolucion",
    "Comunicada",
    "Expediente cerrado",
]

# Valores válidos para el campo `documentacion_pendiente` de `expedientes`.
DOCUMENTACION_PENDIENTE_VALIDA = [
    "No procede",
    "Requerida documentacion administrativa",
    "Requerida documentacion tecnica",
    "Requerida documentacion juridica",
    "Documentacion recibida pendiente revisar",
]

ROLES_VALIDOS = ["administrativo", "tecnico", "juridico"]


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(String(50), nullable=False)
    juridico_defecto: Mapped[bool] = mapped_column(Boolean, default=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)


class TurnoTecnico(Base):
    __tablename__ = "turnos_tecnico"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"))
    semana_inicio: Mapped[Date] = mapped_column(Date, nullable=False)
    semana_fin: Mapped[Date] = mapped_column(Date, nullable=False)

    usuario: Mapped["Usuario"] = relationship(foreign_keys=[usuario_id])


class Expediente(Base):
    __tablename__ = "expedientes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Campos importados del CSV (no editables manualmente salvo indicación)
    numero_orden: Mapped[int | None] = mapped_column(Integer)
    dias: Mapped[int | None] = mapped_column(Integer)
    expediente: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    interesado: Mapped[str | None] = mapped_column(String(255))
    asunto: Mapped[str | None] = mapped_column(Text)
    ubicacion: Mapped[str | None] = mapped_column(String(255))
    situacion_abierto: Mapped[bool] = mapped_column(Boolean, default=True)
    fecha_expediente: Mapped[Date | None] = mapped_column(Date)
    estado_origen: Mapped[str | None] = mapped_column(String(255))

    # Campos de gestión interna (editables por el administrativo)
    fase: Mapped[str] = mapped_column(String(50), nullable=False, default="Sin revisar")
    documentacion_pendiente: Mapped[str] = mapped_column(
        String(50), nullable=False, default="No procede"
    )
    fecha_inicio_evento: Mapped[Date | None] = mapped_column(Date)
    fecha_fin_evento: Mapped[Date | None] = mapped_column(Date)
    tecnico_asignado_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"))
    juridico_asignado_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"))

    # Metadatos
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    fecha_actualizacion: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    tecnico_asignado: Mapped["Usuario"] = relationship(foreign_keys=[tecnico_asignado_id])
    juridico_asignado: Mapped["Usuario"] = relationship(foreign_keys=[juridico_asignado_id])


class FaseHistorico(Base):
    __tablename__ = "fase_historico"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    expediente_id: Mapped[int] = mapped_column(ForeignKey("expedientes.id"))
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"))
    fase_anterior: Mapped[str | None] = mapped_column(String(50))
    fase_nueva: Mapped[str | None] = mapped_column(String(50))
    documentacion_anterior: Mapped[str | None] = mapped_column(String(50))
    documentacion_nueva: Mapped[str | None] = mapped_column(String(50))
    fecha_cambio: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    usuario: Mapped["Usuario"] = relationship(foreign_keys=[usuario_id])
