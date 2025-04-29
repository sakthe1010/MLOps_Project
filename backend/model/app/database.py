from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# OLD (SQLite):
# DATABASE_URL = "sqlite:///./users.db"

# NEW (Postgres):
DATABASE_URL = "postgresql://mcq_user:mcq_pass@localhost/mcq_db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
