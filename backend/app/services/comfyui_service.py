
import json
import time
from pathlib import Path

import requests


COMFYUI_URL = "http://127.0.0.1:8188"

BACKEND_DIR = Path(__file__).resolve().parents[2]
WORKFLOW_PATH = BACKEND_DIR / "image_sdxl_simple_api.json"
OUTPUT_DIR = BACKEND_DIR / "generated_images"

NEGATIVE_PROMPT = (
    "extra limbs, extra tails, deformed faces, bad anatomy, "
    "blurry, duplicate characters, text, watermark, logo"
)


def generate_image(prompt: str) -> Path:
    """Generate one image with ComfyUI and return its saved file path."""

    if not prompt.strip():
        raise ValueError("Image prompt cannot be empty.")

    if not WORKFLOW_PATH.exists():
        raise RuntimeError(
            f"ComfyUI workflow not found: {WORKFLOW_PATH}"
        )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    try:
        with WORKFLOW_PATH.open("r", encoding="utf-8") as file:
            workflow = json.load(file)

        # Insert the scene prompt and negative prompt.
        workflow["10"]["inputs"]["text"] = prompt
        workflow["11"]["inputs"]["text"] = NEGATIVE_PROMPT

        # Use a random seed for each generation.
        workflow["12"]["inputs"]["seed"] = int(
            time.time_ns() % (2**32)
        )

        response = requests.post(
            f"{COMFYUI_URL}/prompt",
            json={"prompt": workflow},
            timeout=30,
        )
        response.raise_for_status()
        prompt_id = response.json()["prompt_id"]

        # Wait for ComfyUI to finish rendering.
        deadline = time.monotonic() + 300

        while time.monotonic() < deadline:
            history_response = requests.get(
                f"{COMFYUI_URL}/history/{prompt_id}",
                timeout=15,
            )
            history_response.raise_for_status()

            history = history_response.json()

            if prompt_id in history:
                entry = history[prompt_id]

                if entry.get("status", {}).get("status_str") == "error":
                    raise RuntimeError(
                        "ComfyUI reported an image-generation error."
                    )

                outputs = entry.get("outputs", {})
                save_output = outputs.get("7", {})
                images = save_output.get("images", [])

                if images:
                    image_info = images[0]

                    image_response = requests.get(
                        f"{COMFYUI_URL}/view",
                        params={
                            "filename": image_info["filename"],
                            "subfolder": image_info.get("subfolder", ""),
                            "type": image_info.get("type", "output"),
                        },
                        timeout=60,
                    )
                    image_response.raise_for_status()

                    filename = f"{prompt_id}.png"
                    output_path = OUTPUT_DIR / filename
                    output_path.write_bytes(image_response.content)

                    return output_path

            time.sleep(1)

        raise RuntimeError(
            "Image generation timed out after 5 minutes."
        )

    except requests.RequestException as exc:
        raise RuntimeError(
            "Could not communicate with ComfyUI. "
            "Make sure ComfyUI is running on port 8188."
        ) from exc

    except (KeyError, TypeError, json.JSONDecodeError) as exc:
        raise RuntimeError(
            "The ComfyUI workflow returned an unexpected response."
        ) from exc
