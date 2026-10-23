
from app.models.story import Scene, StoryPlan, StoryRequest


SCENE_BEATS = [
    ("Meet the characters", "Introduce the characters and their world."),
    ("Discover something", "The characters discover something interesting."),
    ("Begin the adventure", "The characters explore together."),
    ("Face a challenge", "They encounter a small challenge."),
    ("Solve the problem", "They work together to solve it."),
    ("Happy ending", "End with a warm friendship moment."),
]


def create_story_plan(request: StoryRequest) -> StoryPlan:
    count = min(6, request.duration // 10)
    base, remainder = divmod(request.duration, count)
    scenes = []

    for index in range(count):
        title, action = SCENE_BEATS[index]
        seconds = base + (1 if index < remainder else 0)

        scenes.append(Scene(
            scene_number=index + 1,
            title=title,
            description=f"{request.prompt}\n{action}",
            duration_seconds=seconds,
            narration=action if request.voice != "No voice" else "",
            visual_prompt=(
                f"{request.style}. {request.prompt} "
                f"Scene action: {action} "
                "Keep characters visually consistent."
            ),
        ))

    title = " ".join(request.prompt.split())[:70]
    if len(request.prompt) > 70:
        title += "..."

    return StoryPlan(
        title=title,
        total_duration=request.duration,
        aspect_ratio=request.aspect_ratio,
        animation_style=request.style,
        voice_setting=request.voice,
        music_mood=request.music,
        scenes=scenes,
    )
