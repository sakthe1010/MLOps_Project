import uuid
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class ReportModel(Base):
    __tablename__ = "reports"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
    username = Column(String, index=True, nullable=False)
    mode = Column(String, nullable=False)           # 'test' or 'practice'
    score = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)
    context_json = Column(JSONB, nullable=False)
    wrong_questions = Column(JSONB, nullable=False)