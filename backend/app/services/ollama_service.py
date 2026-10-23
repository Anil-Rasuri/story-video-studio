
import json

import requests


OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
OLLAMA_MODEL = "qwen2.5:3b"


def generate_story_with_ollama(
    prompt: str,
    duration: int,
    aspect_ratio: str,
    style: str,
    voice: str,
    music: str,
) -> dict:
    """Generate a structured animated story plan using local Ollama."""

    scene_counts = {
        15: 3,
        30: 4,
        45: 5,
        60: 6,
    }

    scene_count = scene_counts.get(duration)

    if scene_count is None:
        raise ValueError("Duration must be 15, 30, 45, or 60 seconds.")

    base_duration = duration // scene_count
    remainder = duration % scene_count

    scene_durations = [
        base_duration + (1 if i < remainder else 0)
        for i in range(scene_count)
    ]

    duration_instructions = ", ".join(
        str(seconds) for seconds in scene_durations
    )

    system_prompt = """
You are a professional animated short-story planner.

Return ONLY valid JSON. Do not use Markdown or code fences.

The JSON must have these fields:
{
  "title": "Story title",
  "total_duration": 15,
  "aspect_ratio": "9:16",
  "animation_style": "3D cartoon",
  "voice_setting": "Narrator",
  "music_mood": "Playful",
  "scenes": [
    {
      "scene_number": 1,
      "title": "Scene title",
      "description": "What happens in this scene",
      "duration_seconds": 5,
      "narration": "Spoken dialogue or narration",
      "visual_prompt": "Detailed visual prompt for generating this scene"
    }
  ]
}

Requirements:
- Create exactly the requested number of scenes.
- Keep character appearances consistent across every scene.
- Make the story coherent, with a beginning, middle, and ending.
- Include character actions, expressions, and surroundings in visual prompts.
- Use dialogue or narration appropriate for the selected voice.
- Follow the requested animation style and aspect ratio.
- Use the exact scene durations supplied by the user.
- The sum of scene durations must equal the requested total duration.
- Return JSON only.
"""

    user_prompt = f"""
Create an animated story from this idea:

{prompt}

Total duration: {duration} seconds
Number of scenes: {scene_count}
Scene durations in order: {duration_instructions} seconds
Aspect ratio: {aspect_ratio}
Animation style: {style}
Voice setting: {voice}
Music mood: {music}

Use the exact scene durations listed above.
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "format": "json",
                "stream": False,
                "options": {"temperature": 0.3},
            },
            timeout=180,
        )

        response.raise_for_status()
        result = response.json()
        content = result["message"]["content"]
        story = json.loads(content)

        if not isinstance(story.get("scenes"), list):
            raise ValueError("Ollama returned an invalid scene list.")

        if len(story["scenes"]) != scene_count:
            raise ValueError(
                f"Expected {scene_count} scenes, "
                f"but Ollama returned {len(story['scenes'])}."
            )

        for index, scene in enumerate(story["scenes"]):
            scene["scene_number"] = index + 1
            scene["duration_seconds"] = scene_durations[index]

        story["total_duration"] = duration
        story["aspect_ratio"] = aspect_ratio
        story["animation_style"] = style
        story["voice_setting"] = voice
        story["music_mood"] = music

        return story

    except requests.RequestException as exc:
        raise RuntimeError(
            "Could not connect to Ollama. Make sure Ollama is running "
            "and qwen2.5:3b is installed."
        ) from exc

    except (KeyError, TypeError, json.JSONDecodeError) as exc:
        raise RuntimeError(
            "Ollama returned an invalid story response. Please try again."
        ) from exc
