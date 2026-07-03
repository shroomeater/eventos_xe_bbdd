"""Script de carga semanal del CSV exportado por el gestor municipal de expedientes.

Uso por línea de comandos:
    python scripts/importar_csv.py ruta/al/fichero.csv
"""

import csv
import io
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy.orm import Session

from database import SessionLocal
from logica import preasignar_tecnico_juridico
from models import Expediente

# Mapeo cabecera CSV -> campo en BD
MAPEO_CABECERAS = {
    "Nº": "numero_orden",
    "N.º": "numero_orden",
    "Días": "dias",
    "Dias": "dias",
    "Expediente": "expediente",
    "Interesado": "interesado",
    "Asunto": "asunto",
    "Situación": "situacion_abierto",
    "Situacion": "situacion_abierto",
    "Data Exp.": "fecha_expediente",
    "Data Exp": "fecha_expediente",
    "Estado": "estado_origen",
    "Ubicación": "ubicacion",
    "Ubicacion": "ubicacion",
}

CAMPOS_ACTUALIZABLES = [
    "numero_orden",
    "dias",
    "interesado",
    "asunto",
    "ubicacion",
    "situacion_abierto",
    "fecha_expediente",
    "estado_origen",
]


def _parsear_bool(valor: str | None) -> bool:
    if valor is None:
        return True
    valor = valor.strip().lower()
    return valor not in ("false", "0", "no", "cerrado", "n", "")


def _parsear_fecha(valor: str | None):
    if not valor or not valor.strip():
        return None
    try:
        return datetime.strptime(valor.strip(), "%d/%m/%Y").date()
    except ValueError:
        return None


def _parsear_int(valor: str | None):
    if not valor or not valor.strip():
        return None
    try:
        return int(valor.strip())
    except ValueError:
        return None


def _fila_a_dict(fila: dict) -> dict | None:
    datos: dict = {}
    for cabecera, valor in fila.items():
        if cabecera is None:
            continue
        campo = MAPEO_CABECERAS.get(cabecera.strip())
        if campo is None:
            continue
        datos[campo] = valor

    if not datos.get("expediente"):
        return None

    return {
        "expediente": datos["expediente"].strip(),
        "numero_orden": _parsear_int(datos.get("numero_orden")),
        "dias": _parsear_int(datos.get("dias")),
        "interesado": (datos.get("interesado") or "").strip() or None,
        "asunto": (datos.get("asunto") or "").strip() or None,
        "ubicacion": (datos.get("ubicacion") or "").strip() or None,
        "situacion_abierto": _parsear_bool(datos.get("situacion_abierto")),
        "fecha_expediente": _parsear_fecha(datos.get("fecha_expediente")),
        "estado_origen": (datos.get("estado_origen") or "").strip() or None,
    }


def importar_csv(contenido: str, db: Session) -> dict:
    """Importa el contenido de un CSV (como texto) y devuelve un resumen.

    Para cada fila realiza un upsert por número de expediente. Los expedientes
    nuevos reciben preasignación automática de técnico/jurídico. Los campos de
    gestión interna de expedientes ya existentes no se modifican.
    """
    lector = csv.DictReader(io.StringIO(contenido))

    nuevos = 0
    actualizados = 0
    errores: list[str] = []

    for numero_fila, fila in enumerate(lector, start=2):
        try:
            datos = _fila_a_dict(fila)
            if datos is None:
                errores.append(f"Fila {numero_fila}: sin número de expediente, omitida")
                continue

            existente = (
                db.query(Expediente)
                .filter(Expediente.expediente == datos["expediente"])
                .first()
            )

            if existente:
                for campo in CAMPOS_ACTUALIZABLES:
                    setattr(existente, campo, datos[campo])
                actualizados += 1
            else:
                exp = Expediente(**datos)
                tecnico_id, juridico_id = preasignar_tecnico_juridico(db)
                exp.tecnico_asignado_id = tecnico_id
                exp.juridico_asignado_id = juridico_id
                db.add(exp)
                nuevos += 1

        except Exception as exc:  # noqa: BLE001 - se recoge cualquier fila defectuosa
            errores.append(f"Fila {numero_fila}: {exc}")

    db.commit()

    return {"nuevos": nuevos, "actualizados": actualizados, "errores": errores}


def main():
    if len(sys.argv) != 2:
        print("Uso: python scripts/importar_csv.py ruta/al/fichero.csv")
        sys.exit(1)

    ruta = Path(sys.argv[1])
    if not ruta.exists():
        print(f"No se encuentra el fichero: {ruta}")
        sys.exit(1)

    contenido = ruta.read_text(encoding="utf-8-sig")

    db = SessionLocal()
    try:
        resumen = importar_csv(contenido, db)
    finally:
        db.close()

    print(f"Nuevos: {resumen['nuevos']}")
    print(f"Actualizados: {resumen['actualizados']}")
    if resumen["errores"]:
        print(f"Errores ({len(resumen['errores'])}):")
        for error in resumen["errores"]:
            print(f"  - {error}")


if __name__ == "__main__":
    main()
