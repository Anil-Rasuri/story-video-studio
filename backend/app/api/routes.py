
from fastapi import APIRouter

from app.models.story import StoryPlan, StoryRequest
from app.services.story_planner import create_story_plan


router = APIRouter(prefix="/api")


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "application": "Story Video Studio",
        "mode": "local",
    }


@router.post("/plan-story", response_model=StoryPlan)
def plan_story(request: StoryRequest):
    return create_story_plan(request)
