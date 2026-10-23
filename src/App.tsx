import BackendStatus from "./components/BackendStatus";
import StoryPlanView from "./components/StoryPlanView";
import { planStory } from "./services/api";
import type { StoryPlan, StoryRequest } from "./types/story";

import { useRef, useState } from "react";
import "./App.css";

type ReferenceImage = {
  id: string
  name: string
  url: string
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState<StoryRequest["duration"]>(60)
  const [aspectRatio, setAspectRatio] = useState<StoryRequest["aspect_ratio"]>("9:16")
  const [style, setStyle] = useState('Cute 3D Animation')
  const [voice, setVoice] = useState('Character dialogue')
  const [music, setMusic] = useState('Cheerful')
  const [images, setImages] = useState<ReferenceImage[]>([])
  const [status, setStatus] = useState('')
  const [plan, setPlan] = useState<StoryPlan | null>(null)
  const [isPlanning, setIsPlanning] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  function handleImageUpload(files: FileList | null) {
    if (!files) return

    const selected = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(file),
      }))

    setImages((previous) => [...previous, ...selected])
    setStatus('')
  }

  function removeImage(id: string) {
    setImages((previous) => {
      const image = previous.find((item) => item.id === id)
      if (image) URL.revokeObjectURL(image.url)
      return previous.filter((item) => item.id !== id)
    })
  }

  async function prepareStory() {
    if (prompt.trim().length < 5) {
      setPlan(null)
      setStatus("Enter a story idea with at least 5 characters.")
      return
    }

    setIsPlanning(true)
    setPlan(null)
    setStatus("Creating your scene plan...")

    try {
      const result = await planStory({
        prompt: prompt.trim(),
        duration,
        aspect_ratio: aspectRatio,
        style,
        voice,
        music,
      })

      setPlan(result)
      setStatus("Story plan created. This version uses template-based planning, not an AI model.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred."
      setStatus(`Could not create the story plan. ${message} Check that the Python backend is running.`)
    } finally {
      setIsPlanning(false)
    }
  }

  return (
    <main className="studio">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-name">StoryStudio</div>
            <div className="brand-subtitle">LOCAL AI CREATOR</div>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <button className="nav-item active" type="button">
          <span className="nav-icon">✳</span>
          Create a story
        </button>
        <button
          className="nav-item"
          type="button"
          onClick={() => setStatus('Your saved projects will appear here once project storage is implemented.')}
        >
          <span className="nav-icon">▤</span>
          My projects
        </button>
        <button
          className="nav-item"
          type="button"
          onClick={() => setStatus('Model settings will be available after local AI integration.')}
        >
          <span className="nav-icon">⚙</span>
          AI models
        </button>

        <div className="sidebar-bottom">
          <div className="local-card">
            <span className="status-dot" />
            <div>
              <strong>Local workspace</strong>
              <p>Designed for offline AI</p>
            </div>
          </div>
          <div className="version-label">STORYSTUDIO · PREVIEW</div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>New story</strong>
          </div>
          <div className="topbar-right">
            <span className="free-badge">FREE · LOCAL MODE</span>
            <div className="avatar">A</div>
          </div>
        </header>

        <div className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">YOUR IMAGINATION, ANIMATED</div>
              <h1>Create your next story</h1>
              <p className="page-description">
                Turn an idea into an animated story with characters, voices,
                music, and sound.
              </p>
            </div>
            <div className="duration-chip">
              <span>◷</span> Up to 60 seconds
            </div>
          </div>

          <div className="workspace-grid">
            <section className="panel prompt-panel">
              <div className="panel-heading">
                <div>
                  <span className="step-number">01</span>
                  <h2>Tell your story</h2>
                </div>
                <span className="optional-label">START WITH AN IDEA</span>
              </div>

              <label className="field-label" htmlFor="story-prompt">
                Story prompt
              </label>
              <textarea
                id="story-prompt"
                className="story-textarea"
                placeholder="A little blue monkey meets a playful red monkey in a magical forest. They discover a golden banana, go on a tiny adventure, and learn to share..."
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value)
                  setStatus('')
                }}
                maxLength={3000}
              />
              <div className="textarea-footer">
                <span>Describe the characters, actions, and ending.</span>
                <span>{prompt.length}/3000</span>
              </div>

              <div className="examples">
                <span className="field-label">TRY AN IDEA</span>
                <div className="example-chips">
                  <button
                    type="button"
                    onClick={() => setPrompt('A cute blue monkey and a red monkey find a magical banana in the forest. They go on a funny adventure and learn to share. End with a happy friendship moment.')}
                  >
                    🐒 Monkey adventure
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrompt('A tiny rabbit gets lost in a colorful garden. A friendly bird helps it find its way home before sunset.')}
                  >
                    🐰 Little animal tale
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrompt('A tiny robot plants a seed on a lonely planet. With patience and kindness, it grows a beautiful glowing garden.')}
                  >
                    ✨ Magical world
                  </button>
                </div>
              </div>

              <div className="section-divider" />

              <div className="panel-heading compact-heading">
                <div>
                  <span className="step-number">02</span>
                  <h2>Character references</h2>
                </div>
                <span className="optional-label">OPTIONAL</span>
              </div>
              <p className="helper-text">
                Upload character images to guide the look of your story.
              </p>

              <input
                ref={fileInput}
                className="hidden-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={(event) => {
                  handleImageUpload(event.target.files)
                  event.target.value = ''
                }}
              />

              <button
                className="upload-zone"
                type="button"
                onClick={() => fileInput.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  handleImageUpload(event.dataTransfer.files)
                }}
              >
                <span className="upload-icon">↑</span>
                <strong>Upload reference images</strong>
                <span>PNG, JPG or WEBP · Choose one or more</span>
              </button>

              {images.length > 0 && (
                <div className="reference-grid">
                  {images.map((image) => (
                    <div className="reference-item" key={image.id}>
                      <img src={image.url} alt={image.name} />
                      <span title={image.name}>{image.name}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${image.name}`}
                        onClick={() => removeImage(image.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="section-divider" />

              <div className="panel-heading compact-heading">
                <div>
                  <span className="step-number">03</span>
                  <h2>Video settings</h2>
                </div>
              </div>

              <div className="settings-grid">
                <div className="setting-field">
                  <label className="field-label" htmlFor="duration">
                    Duration
                  </label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(event) => setDuration(Number(event.target.value) as StoryRequest["duration"])}
                  >
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={45}>45 seconds</option>
                    <option value={60}>60 seconds</option>
                  </select>
                </div>

                <div className="setting-field">
                  <label className="field-label" htmlFor="style">
                    Animation style
                  </label>
                  <select
                    id="style"
                    value={style}
                    onChange={(event) => setStyle(event.target.value)}
                  >
                    <option>Cute 3D Animation</option>
                    <option>2D Cartoon</option>
                    <option>Anime</option>
                    <option>Storybook</option>
                    <option>Stop Motion</option>
                  </select>
                </div>
              </div>

              <div className="setting-field ratio-field">
                <span className="field-label">Video format</span>
                <div className="ratio-options">
                  {([
                    ['9:16', '▯', 'Vertical'],
                    ['16:9', '▱', 'Landscape'],
                    ['1:1', '□', 'Square'],
                  ] as const).map(([ratio, symbol, label]) => (
                    <button
                      className={`ratio-option ${aspectRatio === ratio ? 'selected' : ''}`}
                      type="button"
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                    >
                      <span className="ratio-symbol">{symbol}</span>
                      <span>{label}</span>
                      <small>{ratio}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-grid audio-settings">
                <div className="setting-field">
                  <label className="field-label" htmlFor="voice">
                    Voice & dialogue
                  </label>
                  <select
                    id="voice"
                    value={voice}
                    onChange={(event) => setVoice(event.target.value)}
                  >
                    <option>Character dialogue</option>
                    <option>Narrator only</option>
                    <option>Dialogue + narration</option>
                    <option>No voice</option>
                  </select>
                </div>
                <div className="setting-field">
                  <label className="field-label" htmlFor="music">
                    Music mood
                  </label>
                  <select
                    id="music"
                    value={music}
                    onChange={(event) => setMusic(event.target.value)}
                  >
                    <option>Cheerful</option>
                    <option>Magical</option>
                    <option>Emotional</option>
                    <option>Funny</option>
                    <option>Peaceful</option>
                    <option>No music</option>
                  </select>
                </div>
              </div>

              <button
                className="create-button"
                type="button"
                onClick={() => void prepareStory()}
                disabled={isPlanning}
              >
                <span>✦</span> {isPlanning ? "Planning scenes..." : "Prepare story"}
                <span className="button-arrow">{isPlanning ? "…" : "→"}</span>
              </button>

              {status && (
                <div className="status-message" role="status">
                  {status}
                </div>
              )}

              <p className="privacy-note">
                <span>⌑</span> Designed for local processing. Your references
                stay in this preview until you close or refresh it.
              </p>
            </section>

            <aside className="right-column">
              <section className="preview-panel">
                <div className="preview-heading">
                  <div>
                    <h2>Story preview</h2>
                    <p>Your video will appear here</p>
                  </div>
                  <span className="preview-tag">PREVIEW</span>
                </div>

                <div className={`video-canvas ratio-${aspectRatio.replace(':', '-')}`}>
                  <div className="canvas-glow glow-one" />
                  <div className="canvas-glow glow-two" />
                  <div className="forest-scene">
                    <div className="moon" />
                    <div className="star star-one">✦</div>
                    <div className="star star-two">✧</div>
                    <div className="tree tree-left"><i /><b /></div>
                    <div className="tree tree-right"><i /><b /></div>
                    <div className="hill hill-back" />
                    <div className="hill hill-front" />
                    <div className="monkey monkey-blue">
                      <div className="ear ear-left" />
                      <div className="ear ear-right" />
                      <div className="monkey-face">
                        <i className="eye eye-left" />
                        <i className="eye eye-right" />
                        <i className="cheek cheek-left" />
                        <i className="cheek cheek-right" />
                        <i className="mouth" />
                      </div>
                      <div className="monkey-body" />
                    </div>
                    <div className="monkey monkey-red">
                      <div className="ear ear-left" />
                      <div className="ear ear-right" />
                      <div className="monkey-face">
                        <i className="eye eye-left" />
                        <i className="eye eye-right" />
                        <i className="cheek cheek-left" />
                        <i className="cheek cheek-right" />
                        <i className="mouth" />
                      </div>
                      <div className="monkey-body" />
                    </div>
                    <div className="ground" />
                  </div>
                  <div className="canvas-caption">
                    <span className="live-dot" /> CHARACTER CONCEPT
                  </div>
                </div>

                <div className="preview-meta">
                  <div>
                    <span>FORMAT</span>
                    <strong>{aspectRatio}</strong>
                  </div>
                  <div>
                    <span>DURATION</span>
                    <strong>{duration}s</strong>
                  </div>
                  <div>
                    <span>STYLE</span>
                    <strong>{style}</strong>
                  </div>
                </div>
                <p className="preview-disclaimer">
                  Illustrative concept only — AI-generated video is not connected yet.
                </p>
              </section>

              <section className="workflow-panel">
                <div className="workflow-title">
                  <h2>Creation workflow</h2>
                  <span>4 STEPS</span>
                </div>
                <div className="workflow-step">
                  <div className="workflow-icon completed">✓</div>
                  <div>
                    <strong>Story brief</strong>
                    <p>Prompt and creative settings</p>
                  </div>
                  <span className="workflow-state">READY</span>
                </div>
                <div className="workflow-step">
                  <div className="workflow-icon">02</div>
                  <div>
                    <strong>Plan the scenes</strong>
                    <p>Script, actions, and dialogue</p>
                  </div>
                  <span className="workflow-state pending">NEXT</span>
                </div>
                <div className="workflow-step">
                  <div className="workflow-icon">03</div>
                  <div>
                    <strong>Generate animation</strong>
                    <p>Characters and video clips</p>
                  </div>
                  <span className="workflow-state pending">WAITING</span>
                </div>
                <div className="workflow-step">
                  <div className="workflow-icon">04</div>
                  <div>
                    <strong>Audio & export</strong>
                    <p>Voices, music, and MP4</p>
                  </div>
                  <span className="workflow-state pending">WAITING</span>
                </div>
              </section>
            </aside>
          </div>

          {plan && <StoryPlanView plan={plan} />}

          <footer className="page-footer">
            <span>STORYSTUDIO <span className="footer-separator">/</span> LOCAL AI WORKSPACE</span>
            <span>Built for your imagination ✦</span>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default App

