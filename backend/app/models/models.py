from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, Enum):
    STUDENT = "student"
    ADMIN = "admin"


class StageStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.STUDENT)
    grade_level: Mapped[str | None] = mapped_column(String(8), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    policy_version: Mapped[str] = mapped_column(String(50))
    consent_status: Mapped[bool] = mapped_column(Boolean, default=True)
    consented_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class QuestionnaireVersion(Base):
    __tablename__ = "questionnaire_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    version: Mapped[str] = mapped_column(String(20))
    scoring_type: Mapped[str] = mapped_column(String(50))
    definition: Mapped[dict] = mapped_column(JSON)


class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    questionnaire_version_id: Mapped[int] = mapped_column(ForeignKey("questionnaire_versions.id"))
    answers: Mapped[dict] = mapped_column(JSON)
    computed_vector: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AcademicGrade(Base):
    __tablename__ = "academic_grades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    semester: Mapped[str] = mapped_column(String(20))
    subject_code: Mapped[str] = mapped_column(String(20))
    grade_value: Mapped[float] = mapped_column(Float)

    __table_args__ = (UniqueConstraint("user_id", "semester", "subject_code", name="uq_grade_user_sem_subject"),)


class NationalReference(Base):
    __tablename__ = "national_references"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    subject_code: Mapped[str] = mapped_column(String(20), index=True)
    mean_value: Mapped[float] = mapped_column(Float)
    std_dev: Mapped[float] = mapped_column(Float)
    version: Mapped[str] = mapped_column(String(20), index=True)
    provenance: Mapped[str] = mapped_column(Text)


class AdmissionBlockMapping(Base):
    __tablename__ = "admission_block_mappings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    block_code: Mapped[str] = mapped_column(String(10), index=True)
    subject_codes: Mapped[list[str]] = mapped_column(JSON)
    version: Mapped[str] = mapped_column(String(20))
    provenance: Mapped[str] = mapped_column(Text)


class Major(Base):
    __tablename__ = "majors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    moet_code_level_iv: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    riasec_vector: Mapped[dict] = mapped_column(JSON)
    preference_vector: Mapped[dict] = mapped_column(JSON)
    required_blocks: Mapped[list[str]] = mapped_column(JSON, default=list)
    hard_skills: Mapped[list[str]] = mapped_column(JSON, default=list)
    soft_skills: Mapped[list[str]] = mapped_column(JSON, default=list)
    source_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class RecommendationRun(Base):
    __tablename__ = "recommendation_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    formula_version: Mapped[str] = mapped_column(String(20), default="v1")
    inputs: Mapped[dict] = mapped_column(JSON)
    results: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ImportBatch(Base):
    __tablename__ = "import_batches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uploaded_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    source_name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class StagedMajorRecord(Base):
    __tablename__ = "staged_major_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    batch_id: Mapped[int] = mapped_column(ForeignKey("import_batches.id", ondelete="CASCADE"), index=True)
    major_name: Mapped[str] = mapped_column(String(255))
    moet_code_level_iv: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[StageStatus] = mapped_column(SAEnum(StageStatus), default=StageStatus.PENDING, index=True)
    extracted_payload: Mapped[dict] = mapped_column(JSON)
    citations: Mapped[list[dict]] = mapped_column(JSON, default=list)
    reviewer_notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    actor_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(100))
    entity: Mapped[str] = mapped_column(String(100))
    entity_id: Mapped[str] = mapped_column(String(50))
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
