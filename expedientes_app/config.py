import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://usuario:password@localhost:5432/expedientes")
JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "8"))
DIAS_HABILES_INCOMPLETO = int(os.getenv("DIAS_HABILES_INCOMPLETO", "3"))
