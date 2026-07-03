"""Bootstrap do primeiro usuario administrativo.

Necesario porque POST /usuarios esixe estar autenticado como
administrativo, así que o primeiro usuario hai que crealo á man.

Uso:
    python scripts/crear_admin.py --nombre "Ana Administrativa" \\
        --email ana@vigo.gal --password "contrasinal-segura"
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from auth.utils import hash_password
from database import SessionLocal
from models import Usuario


def crear_admin(nombre: str, email: str, password: str) -> None:
    db = SessionLocal()
    try:
        if db.query(Usuario).filter(Usuario.email == email).first():
            print(f"Xa existe un usuario con ese email: {email}")
            return

        usuario = Usuario(
            nombre=nombre,
            email=email,
            password_hash=hash_password(password),
            rol="administrativo",
            activo=True,
        )
        db.add(usuario)
        db.commit()
        print(f"Usuario administrativo creado: {email}")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--nombre", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    crear_admin(args.nombre, args.email, args.password)


if __name__ == "__main__":
    main()
