
from fastapi import APIRouter, HTTPException

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
    if not request.prompt.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a story idea.",
        )

    try:
        return create_story_plan(request)

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Story planning failed. Please try again.",
        ) from exc
