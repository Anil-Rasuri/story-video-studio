
import type { StoryPlan, StoryRequest } from "../types/story";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function checkBackendHealth(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error("Backend health check failed.");
  }
}

export async function planStory(
  request: StoryRequest,
): Promise<StoryPlan> {
  const response = await fetch(`${API_BASE_URL}/api/plan-story`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Story planning failed (${response.status}).`);
  }

  return response.json() as Promise<StoryPlan>;
}
