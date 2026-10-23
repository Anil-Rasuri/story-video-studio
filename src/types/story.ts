
export interface StoryRequest {
  prompt: string;
  duration: 15 | 30 | 45 | 60;
  aspect_ratio: "9:16" | "16:9" | "1:1";
  style: string;
  voice: string;
  music: string;
}

export interface StoryScene {
  scene_number: number;
  title: string;
  description: string;
  duration_seconds: number;
  narration: string;
  visual_prompt: string;
}

export interface StoryPlan {
  title: string;
  total_duration: number;
  aspect_ratio: string;
  animation_style: string;
  voice_setting: string;
  music_mood: string;
  scenes: StoryScene[];
}
