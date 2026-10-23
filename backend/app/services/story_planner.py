
from app.models.story import Scene, StoryPlan, StoryRequest
from app.services.ollama_service import generate_story_with_ollama


def create_story_plan(request: StoryRequest) -> StoryPlan:
    """Create an AI-generated story plan using local Ollama."""

    story_data = generate_story_with_ollama(
        prompt=request.prompt,
        duration=request.duration,
        aspect_ratio=request.aspect_ratio,
        style=request.style,
        voice=request.voice,
        music=request.music,
    )

    scenes = []

    for scene_data in story_data["scenes"]:
        if request.voice == "No voice":
            scene_data["narration"] = ""

        scenes.append(Scene(**scene_data))

    return StoryPlan(
        title=story_data["title"],
        total_duration=request.duration,
        aspect_ratio=request.aspect_ratio,
        animation_style=request.style,
        voice_setting=request.voice,
        music_mood=request.music,
        scenes=scenes,
    )
