
from typing import Literal

from pydantic import BaseModel, Field


class StoryRequest(BaseModel):
    prompt: str = Field(min_length=5, max_length=3000)
    duration: Literal[15, 30, 45, 60] = 60
    aspect_ratio: Literal["9:16", "16:9", "1:1"] = "9:16"
    style: str = "Cute 3D Animation"
    voice: str = "Character dialogue"
    music: str = "Cheerful"


class Scene(BaseModel):
    scene_number: int
    title: str
    description: str
    duration_seconds: int
    narration: str
    visual_prompt: str


class StoryPlan(BaseModel):
    title: str
    total_duration: int
    aspect_ratio: str
    animation_style: str
    voice_setting: str
    music_mood: str
    scenes: list[Scene]
