from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AdmissionBlockMapping, Major, NationalReference, QuestionnaireVersion


async def seed_demo_data(db: AsyncSession) -> None:
    major_count = await db.scalar(select(Major.id).limit(1))
    if major_count:
        return

    db.add_all(
        [
            QuestionnaireVersion(
                name="RIASEC Core",
                version="demo-v1",
                scoring_type="riasec",
                definition={"note": "Illustrative demo questionnaire"},
            ),
            NationalReference(subject_code="MATH", mean_value=6.0, std_dev=1.2, version="demo-v1", provenance="Illustrative demo data"),
            NationalReference(subject_code="PHYS", mean_value=5.8, std_dev=1.1, version="demo-v1", provenance="Illustrative demo data"),
            NationalReference(subject_code="ENG", mean_value=6.2, std_dev=1.0, version="demo-v1", provenance="Illustrative demo data"),
            AdmissionBlockMapping(block_code="A00", subject_codes=["MATH", "PHYS", "CHEM"], version="demo-v1", provenance="Illustrative demo mapping"),
            AdmissionBlockMapping(block_code="A01", subject_codes=["MATH", "PHYS", "ENG"], version="demo-v1", provenance="Illustrative demo mapping"),
            AdmissionBlockMapping(block_code="D01", subject_codes=["MATH", "LIT", "ENG"], version="demo-v1", provenance="Illustrative demo mapping"),
            Major(
                name="Computer Science",
                description="Illustrative major seed data (not official).",
                moet_code_level_iv="7480101",
                riasec_vector={"R": 0.5, "I": 0.9, "A": 0.4, "S": 0.3, "E": 0.4, "C": 0.6},
                preference_vector={"E": 0.4, "I": 0.7, "S": 0.5, "N": 0.7, "T": 0.8, "F": 0.2, "J": 0.6, "P": 0.4},
                required_blocks=["A01", "D01"],
                hard_skills=["Algorithmic Thinking", "Programming Basics", "Discrete Mathematics"],
                soft_skills=["Problem Solving", "Teamwork"],
                source_metadata={"source": "illustrative", "circular": "09/2022/TT-BGDĐT (verify)"},
            ),
            Major(
                name="Business Administration",
                description="Illustrative major seed data (not official).",
                moet_code_level_iv="7340101",
                riasec_vector={"R": 0.3, "I": 0.5, "A": 0.4, "S": 0.8, "E": 0.9, "C": 0.7},
                preference_vector={"E": 0.8, "I": 0.3, "S": 0.7, "N": 0.4, "T": 0.5, "F": 0.5, "J": 0.7, "P": 0.3},
                required_blocks=["A00", "D01"],
                hard_skills=["Data Literacy", "Communication", "Economics Fundamentals"],
                soft_skills=["Leadership", "Negotiation"],
                source_metadata={"source": "illustrative", "circular": "09/2022/TT-BGDĐT (verify)"},
            ),
        ]
    )
    await db.commit()
