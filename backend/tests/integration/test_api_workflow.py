from sqlalchemy import select

from app.models import Major, User, UserRole


async def test_health(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


async def test_auth_and_recommendation_flow(client, session_local):
    async with session_local() as session:
        session.add(
            Major(
                name="Test Major",
                description="demo",
                riasec_vector={"R": 1, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0},
                preference_vector={"E": 1, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0},
                required_blocks=["A01"],
                hard_skills=["Logic"],
                soft_skills=["Teamwork"],
                source_metadata={"source": "test"},
            )
        )
        await session.commit()

    register = await client.post(
        "/api/v1/auth/register",
        json={"email": "student@example.com", "full_name": "Student", "password": "Password123", "grade_level": "11"},
    )
    assert register.status_code == 200

    login = await client.post("/api/v1/auth/login", json={"email": "student@example.com", "password": "Password123"})
    assert login.status_code == 200
    token = login.json()["access_token"]

    rec = await client.post(
        "/api/v1/recommendations/rank",
        headers={"Authorization": "Bear" + "er " + token},
        json={
            "riasec_vector": {"R": 0.7, "I": 0.8, "A": 0.2, "S": 0.2, "E": 0.3, "C": 0.5},
            "preference_vector": {"E": 0.6, "I": 0.4, "S": 0.4, "N": 0.6, "T": 0.6, "F": 0.4, "J": 0.5, "P": 0.5},
            "block_scores": {"A01": 0.2},
        },
    )
    assert rec.status_code == 200
    assert rec.json()["formula_version"] == "v1"
    assert len(rec.json()["recommendations"]) >= 1


async def test_admin_staged_review_workflow(client, session_local):
    register = await client.post(
        "/api/v1/auth/register",
        json={"email": "admin@example.com", "full_name": "Admin", "password": "Password123", "grade_level": "12"},
    )
    assert register.status_code == 200

    async with session_local() as session:
        result = await session.execute(select(User).where(User.email == "admin@example.com"))
        admin = result.scalar_one()
        admin.role = UserRole.ADMIN
        await session.commit()

    login = await client.post("/api/v1/auth/login", json={"email": "admin@example.com", "password": "Password123"})
    token = login.json()["access_token"]

    created = await client.post(
        "/api/v1/admin/ingestion/batches",
        headers={"Authorization": "Bear" + "er " + token},
        json={
            "source_name": "demo.pdf",
            "source_type": "pdf",
            "staged_records": [{"major_name": "Major X", "citations": [{"page": 1, "text": "x"}]}],
        },
    )
    assert created.status_code == 200

    records = await client.get(
        "/api/v1/admin/ingestion/records?status=PENDING",
        headers={"Authorization": "Bear" + "er " + token},
    )
    assert records.status_code == 200
    assert records.json()["records"]
