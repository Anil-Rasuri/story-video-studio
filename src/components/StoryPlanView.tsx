
import type { StoryPlan } from "../types/story";

interface Props {
  plan: StoryPlan;
}

export default function StoryPlanView({ plan }: Props) {
  return (
    <section className="panel story-plan-panel">
      <div className="panel-heading">
        <div>
          <span className="step-number">04</span>
          <h2>{plan.title}</h2>
        </div>
        <span className="optional-label">
          {plan.total_duration}s · {plan.aspect_ratio}
        </span>
      </div>

      <p className="helper-text">
        {plan.animation_style} · {plan.music_mood} music
      </p>

      <div className="scene-list">
        {plan.scenes.map((scene) => (
          <article className="scene-card" key={scene.scene_number}>
            <div className="scene-card-heading">
              <span className="step-number">
                {String(scene.scene_number).padStart(2, "0")}
              </span>
              <h3>{scene.title}</h3>
              <span className="scene-duration">
                {scene.duration_seconds}s
              </span>
            </div>

            <p>{scene.description}</p>

            {scene.narration && (
              <p className="scene-narration">
                <strong>Narration:</strong> {scene.narration}
              </p>
            )}

            <details>
              <summary>View visual prompt</summary>
              <p>{scene.visual_prompt}</p>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
