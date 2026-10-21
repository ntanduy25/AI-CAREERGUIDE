from __future__ import annotations

import asyncio

from app.core.config import get_settings


class RoadmapRAGService:
    async def generate_guidance(self, major_name: str, gaps: list[str]) -> dict:
        settings = get_settings()

        async def _fallback() -> dict:
            milestones = [
                f"Tăng cường năng lực {gap}" for gap in gaps
            ] or ["Ôn tập kiến thức nền tảng và khám phá môn chuyên ngành liên quan"]
            return {
                "source": "template-fallback",
                "major_name": major_name,
                "milestones": milestones,
                "citations": [],
            }

        if not settings.openai_api_key:
            return await _fallback()

        try:
            return await asyncio.wait_for(_fallback(), timeout=settings.rag_timeout_seconds)
        except TimeoutError:
            return await _fallback()
