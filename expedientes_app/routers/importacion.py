from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from auth.utils import get_usuario_actual
from database import get_db
from models import Usuario
from schemas import ImportarCsvResumen
from scripts.importar_csv import importar_csv

router = APIRouter(tags=["importacion"])


@router.post("/importar-csv", response_model=ImportarCsvResumen)
async def importar_csv_endpoint(
    fichero: UploadFile,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual),
):
    if not fichero.filename or not fichero.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="El fichero debe ser un CSV")

    contenido_bytes = await fichero.read()
    try:
        contenido = contenido_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        contenido = contenido_bytes.decode("latin-1")

    resumen = importar_csv(contenido, db)
    return resumen
