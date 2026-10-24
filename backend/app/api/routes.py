
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.models.story import StoryPlan, StoryRequest
from app.services.story_planner import create_story_plan
from app.services.comfyui_service import generate_image


router = APIRouter(prefix="/api")


class ImageGenerationRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)


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


@router.post("/generate-image")
def generate_scene_image(request: ImageGenerationRequest):
    if not request.prompt.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter an image prompt.",
        )

    try:
        image_path = generate_image(request.prompt)

        return FileResponse(
            path=Path(image_path),
            media_type="image/png",
            filename="story-scene.png",
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc
