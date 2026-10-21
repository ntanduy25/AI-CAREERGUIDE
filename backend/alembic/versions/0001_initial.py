"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2026-10-21 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Enum("STUDENT", "ADMIN", name="userrole"), nullable=False),
        sa.Column("grade_level", sa.String(length=8), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "consent_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("policy_version", sa.String(length=50), nullable=False),
        sa.Column("consent_status", sa.Boolean(), nullable=False),
        sa.Column("consented_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "questionnaire_versions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("version", sa.String(length=20), nullable=False),
        sa.Column("scoring_type", sa.String(length=50), nullable=False),
        sa.Column("definition", sa.JSON(), nullable=False),
    )

    op.create_table(
        "assessment_answers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("questionnaire_version_id", sa.Integer(), sa.ForeignKey("questionnaire_versions.id"), nullable=False),
        sa.Column("answers", sa.JSON(), nullable=False),
        sa.Column("computed_vector", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_assessment_answers_user_id", "assessment_answers", ["user_id"], unique=False)

    op.create_table(
        "academic_grades",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("semester", sa.String(length=20), nullable=False),
        sa.Column("subject_code", sa.String(length=20), nullable=False),
        sa.Column("grade_value", sa.Float(), nullable=False),
        sa.UniqueConstraint("user_id", "semester", "subject_code", name="uq_grade_user_sem_subject"),
    )
    op.create_index("ix_academic_grades_user_id", "academic_grades", ["user_id"], unique=False)

    op.create_table(
        "national_references",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("subject_code", sa.String(length=20), nullable=False),
        sa.Column("mean_value", sa.Float(), nullable=False),
        sa.Column("std_dev", sa.Float(), nullable=False),
        sa.Column("version", sa.String(length=20), nullable=False),
        sa.Column("provenance", sa.Text(), nullable=False),
    )
    op.create_index("ix_national_references_subject_code", "national_references", ["subject_code"], unique=False)
    op.create_index("ix_national_references_version", "national_references", ["version"], unique=False)

    op.create_table(
        "admission_block_mappings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("block_code", sa.String(length=10), nullable=False),
        sa.Column("subject_codes", sa.JSON(), nullable=False),
        sa.Column("version", sa.String(length=20), nullable=False),
        sa.Column("provenance", sa.Text(), nullable=False),
    )
    op.create_index("ix_admission_block_mappings_block_code", "admission_block_mappings", ["block_code"], unique=False)

    op.create_table(
        "majors",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("moet_code_level_iv", sa.String(length=20), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("riasec_vector", sa.JSON(), nullable=False),
        sa.Column("preference_vector", sa.JSON(), nullable=False),
        sa.Column("required_blocks", sa.JSON(), nullable=False),
        sa.Column("hard_skills", sa.JSON(), nullable=False),
        sa.Column("soft_skills", sa.JSON(), nullable=False),
        sa.Column("source_metadata", sa.JSON(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
    )
    op.create_index("ix_majors_moet_code_level_iv", "majors", ["moet_code_level_iv"], unique=False)
    op.create_index("ix_majors_name", "majors", ["name"], unique=False)

    op.create_table(
        "recommendation_runs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("formula_version", sa.String(length=20), nullable=False),
        sa.Column("inputs", sa.JSON(), nullable=False),
        sa.Column("results", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_recommendation_runs_user_id", "recommendation_runs", ["user_id"], unique=False)

    op.create_table(
        "import_batches",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("uploaded_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("source_name", sa.String(length=255), nullable=False),
        sa.Column("source_type", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "staged_major_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("batch_id", sa.Integer(), sa.ForeignKey("import_batches.id", ondelete="CASCADE"), nullable=False),
        sa.Column("major_name", sa.String(length=255), nullable=False),
        sa.Column("moet_code_level_iv", sa.String(length=20), nullable=True),
        sa.Column("status", sa.Enum("PENDING", "APPROVED", "REJECTED", name="stagestatus"), nullable=False),
        sa.Column("extracted_payload", sa.JSON(), nullable=False),
        sa.Column("citations", sa.JSON(), nullable=False),
        sa.Column("reviewer_notes", sa.Text(), nullable=True),
    )
    op.create_index("ix_staged_major_records_batch_id", "staged_major_records", ["batch_id"], unique=False)
    op.create_index("ix_staged_major_records_status", "staged_major_records", ["status"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("actor_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("entity", sa.String(length=100), nullable=False),
        sa.Column("entity_id", sa.String(length=50), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_index("ix_staged_major_records_status", table_name="staged_major_records")
    op.drop_index("ix_staged_major_records_batch_id", table_name="staged_major_records")
    op.drop_table("staged_major_records")
    op.drop_table("import_batches")
    op.drop_index("ix_recommendation_runs_user_id", table_name="recommendation_runs")
    op.drop_table("recommendation_runs")
    op.drop_index("ix_majors_name", table_name="majors")
    op.drop_index("ix_majors_moet_code_level_iv", table_name="majors")
    op.drop_table("majors")
    op.drop_index("ix_admission_block_mappings_block_code", table_name="admission_block_mappings")
    op.drop_table("admission_block_mappings")
    op.drop_index("ix_national_references_version", table_name="national_references")
    op.drop_index("ix_national_references_subject_code", table_name="national_references")
    op.drop_table("national_references")
    op.drop_index("ix_academic_grades_user_id", table_name="academic_grades")
    op.drop_table("academic_grades")
    op.drop_index("ix_assessment_answers_user_id", table_name="assessment_answers")
    op.drop_table("assessment_answers")
    op.drop_table("questionnaire_versions")
    op.drop_table("consent_records")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
