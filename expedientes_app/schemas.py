from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from models import DOCUMENTACION_PENDIENTE_VALIDA, FASES_VALIDAS, ROLES_VALIDOS

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------------------------------------------------------------------------
# Usuarios
# ---------------------------------------------------------------------------


class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: str
    juridico_defecto: bool = False
    activo: bool = True

    @field_validator("rol")
    @classmethod
    def validar_rol(cls, v: str) -> str:
        if v not in ROLES_VALIDOS:
            raise ValueError(f"rol debe ser uno de {ROLES_VALIDOS}")
        return v


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    nombre: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    rol: str | None = None
    juridico_defecto: bool | None = None
    activo: bool | None = None

    @field_validator("rol")
    @classmethod
    def validar_rol(cls, v: str | None) -> str | None:
        if v is not None and v not in ROLES_VALIDOS:
            raise ValueError(f"rol debe ser uno de {ROLES_VALIDOS}")
        return v


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    email: str
    rol: str
    juridico_defecto: bool
    activo: bool


# ---------------------------------------------------------------------------
# Turnos
# ---------------------------------------------------------------------------


class TurnoCreate(BaseModel):
    usuario_id: int
    semana_inicio: date
    semana_fin: date


class TurnoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int | None
    semana_inicio: date
    semana_fin: date
    usuario: UsuarioOut | None = None


# ---------------------------------------------------------------------------
# Expedientes
# ---------------------------------------------------------------------------


class ExpedienteCreate(BaseModel):
    expediente: str
    numero_orden: int | None = None
    dias: int | None = None
    interesado: str | None = None
    asunto: str | None = None
    ubicacion: str | None = None
    situacion_abierto: bool = True
    fecha_expediente: date | None = None
    estado_origen: str | None = None
    fase: str = "Sin revisar"
    documentacion_pendiente: str = "No procede"
    fecha_inicio_evento: date | None = None
    fecha_fin_evento: date | None = None
    tecnico_asignado_id: int | None = None
    juridico_asignado_id: int | None = None


class ExpedienteUpdate(BaseModel):
    fase: str | None = None
    documentacion_pendiente: str | None = None
    fecha_inicio_evento: date | None = None
    fecha_fin_evento: date | None = None
    tecnico_asignado_id: int | None = None
    juridico_asignado_id: int | None = None

    @field_validator("fase")
    @classmethod
    def validar_fase(cls, v: str | None) -> str | None:
        if v is not None and v not in FASES_VALIDAS:
            raise ValueError(f"fase debe ser una de {FASES_VALIDAS}")
        return v

    @field_validator("documentacion_pendiente")
    @classmethod
    def validar_documentacion(cls, v: str | None) -> str | None:
        if v is not None and v not in DOCUMENTACION_PENDIENTE_VALIDA:
            raise ValueError(
                f"documentacion_pendiente debe ser una de {DOCUMENTACION_PENDIENTE_VALIDA}"
            )
        return v


class ExpedienteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    numero_orden: int | None
    dias: int | None
    expediente: str
    interesado: str | None
    asunto: str | None
    ubicacion: str | None
    situacion_abierto: bool
    fecha_expediente: date | None
    estado_origen: str | None
    fase: str
    documentacion_pendiente: str
    fecha_inicio_evento: date | None
    fecha_fin_evento: date | None
    tecnico_asignado_id: int | None
    juridico_asignado_id: int | None
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    incompleto: bool = False


class ExpedienteListOut(ExpedienteOut):
    tecnico_asignado: UsuarioOut | None = None
    juridico_asignado: UsuarioOut | None = None


class FaseHistoricoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    expediente_id: int
    usuario_id: int | None
    fase_anterior: str | None
    fase_nueva: str | None
    documentacion_anterior: str | None
    documentacion_nueva: str | None
    fecha_cambio: datetime
    usuario: UsuarioOut | None = None


class ImportarCsvResumen(BaseModel):
    nuevos: int
    actualizados: int
    errores: list[str]
