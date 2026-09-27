import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const defaultForm = {
  prompt: 'Cinematic luxury product shot of a premium watch resting on dark velvet with soft gold highlights and dramatic studio lighting.',
  negativePrompt: 'blurry, low detail, distorted product, text, watermark',
  referenceImage: '',
  model: 'cinematic',
  preset: 'cinematic',
  lighting: 'soft dramatic',
  mood: 'luxury',
  background: 'studio backdrop',
  camera: 'eye-level',
  subject: 'premium product',
  aspectRatio: '16:9',
  resolution: '1024x1024',
  quality: 'high',
  generationCount: 1,
};

const defaultVideoForm = {
  prompt: 'A cinematic drone shot of a luxury hotel at sunset with dramatic lighting and smooth motion.',
  model: 'gen3',
  aspectRatio: '16:9',
  resolution: '1920x1080',
  duration: 8,
};

export function StudioPage() {
  const { user } = useAuth();
  const [studioMode, setStudioMode] = useState('image');
  const [form, setForm] = useState(defaultForm);
  const [videoForm, setVideoForm] = useState(defaultVideoForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generations, setGenerations] = useState([]);
  const [selectedGenerationId, setSelectedGenerationId] = useState(null);
  const [selectedOutputId, setSelectedOutputId] = useState(null);

  const resolveSelectedOutputId = (generation, fallbackOutputId = null) => {
    if (!generation) return null;
    const outputs = generation.outputs || [];
    if (fallbackOutputId && outputs.some((item) => item.id === fallbackOutputId)) {
      return fallbackOutputId;
    }

    if (generation.selectedOutput) {
      const selectedValue = generation.selectedOutput;
      const match = outputs.find((item) => item.id === selectedValue || item.url === selectedValue || item.thumbnailUrl === selectedValue);
      if (match) return match.id;
    }

    return outputs[0]?.id || null;
  };

  const currentGeneration = useMemo(
    () => generations.find((item) => item.id === selectedGenerationId) || generations[0] || null,
    [generations, selectedGenerationId],
  );

  const selectedMedia = currentGeneration?.outputs || [];
  const featuredOutput = selectedMedia.find((item) => item.id === selectedOutputId) || selectedMedia[0] || null;

  const fetchGenerations = async () => {
    try {
      const response = await apiRequest('/generations');
      const nextGenerations = response.generations || [];
      setGenerations(nextGenerations);

      if (nextGenerations.length) {
        const nextGeneration = nextGenerations.find((item) => item.id === selectedGenerationId) || nextGenerations[0];
        setSelectedGenerationId(nextGeneration.id);
        setSelectedOutputId(resolveSelectedOutputId(nextGeneration, selectedOutputId));
      } else {
        setSelectedGenerationId(null);
        setSelectedOutputId(null);
      }
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your generation history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'generationCount' ? Number(value) : value,
    }));
  };

  const handleReferenceImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((current) => ({ ...current, referenceImage: '' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, referenceImage: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsGenerating(true);

    try {
      const response = await apiRequest('/generations', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (response.generation?.id) {
        setSelectedGenerationId(response.generation.id);
      }

      await fetchGenerations();
    } catch (submitError) {
      setError(submitError.message || 'Unable to generate your concept.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVideoSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsGenerating(true);

    try {
      const response = await apiRequest('/generations', {
        method: 'POST',
        body: JSON.stringify({
          ...videoForm,
          type: 'video',
        }),
      });

      if (response.generation?.id) {
        setSelectedGenerationId(response.generation.id);
      }

      await fetchGenerations();
    } catch (submitError) {
      setError(submitError.message || 'Unable to generate your video concept.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (id) => {
    try {
      await apiRequest(`/generations/${id}/regenerate`, { method: 'POST' });
      await fetchGenerations();
    } catch (submitError) {
      setError(submitError.message || 'Unable to refresh this generation.');
    }
  };

  const isVideoGeneration = currentGeneration?.type === 'video';

  return (
    <div className="studio-page-shell">
      <header className="studio-topbar">
        <div>
          <p className="eyebrow">Creative dashboard</p>
          <h1>Welcome back, {user?.name || 'creator'}.</h1>
        </div>
        <div className="studio-summary-row" aria-label="Studio summary">
          <div className="summary-pill">
            <span className="summary-label">Mode</span>
            <strong>{studioMode === 'image' ? 'Image AI' : 'Video AI'}</strong>
          </div>
          <div className="summary-pill">
            <span className="summary-label">Outputs</span>
            <strong>{selectedMedia.length || 0}</strong>
          </div>
          <div className="summary-pill">
            <span className="summary-label">Status</span>
            <strong>{isGenerating ? 'Generating' : (currentGeneration?.status || 'Ready')}</strong>
          </div>
        </div>
      </header>

      <div className="studio-layout-grid">
        <section className="generator-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">New generation</p>
              <h2>{studioMode === 'image' ? 'Image AI studio' : 'Video AI studio'}</h2>
            </div>
          </div>

          <div className="studio-mode-toggle" role="tablist" aria-label="Studio type selector">
            <button
              type="button"
              className={`studio-mode-button ${studioMode === 'image' ? 'active' : ''}`}
              onClick={() => setStudioMode('image')}
            >
              Image
            </button>
            <button
              type="button"
              className={`studio-mode-button ${studioMode === 'video' ? 'active' : ''}`}
              onClick={() => setStudioMode('video')}
            >
              Video
            </button>
          </div>

          {studioMode === 'image' ? (
            <form className="generation-form" onSubmit={handleSubmit}>
              <label className="field-group">
                <span>Prompt</span>
                <textarea
                  name="prompt"
                  value={form.prompt}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </label>

              <label className="field-group">
                <span>Negative prompt</span>
                <textarea
                  name="negativePrompt"
                  value={form.negativePrompt}
                  onChange={handleChange}
                  rows="2"
                />
              </label>

              <label className="field-group">
                <span>Reference image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceImageChange}
                />
              </label>

              {form.referenceImage ? (
                <div className="field-group">
                  <span>Reference preview</span>
                  <img
                    src={form.referenceImage}
                    alt="Reference preview"
                    style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
              ) : null}

              <div className="two-column-fields">
                <label className="field-group">
                  <span>Model</span>
                  <select name="model" value={form.model} onChange={handleChange}>
                    <option value="cinematic">Cinematic</option>
                    <option value="editorial">Editorial</option>
                    <option value="product">Product</option>
                    <option value="concept">Concept</option>
                  </select>
                </label>

                <label className="field-group">
                  <span>Preset</span>
                  <select name="preset" value={form.preset} onChange={handleChange}>
                    <option value="cinematic">Cinematic</option>
                    <option value="photographic">Photographic</option>
                    <option value="digital-art">Digital Art</option>
                    <option value="enhance">Enhance</option>
                  </select>
                </label>
              </div>

              <div className="two-column-fields">
                <label className="field-group">
                  <span>Lighting</span>
                  <select name="lighting" value={form.lighting} onChange={handleChange}>
                    <option value="soft dramatic">Soft dramatic</option>
                    <option value="golden hour">Golden hour</option>
                    <option value="studio glow">Studio glow</option>
                    <option value="neon">Neon</option>
                  </select>
                </label>

                <label className="field-group">
                  <span>Mood</span>
                  <select name="mood" value={form.mood} onChange={handleChange}>
                    <option value="luxury">Luxury</option>
                    <option value="editorial">Editorial</option>
                    <option value="futuristic">Futuristic</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </label>
              </div>

              <div className="two-column-fields">
                <label className="field-group">
                  <span>Background</span>
                  <select name="background" value={form.background} onChange={handleChange}>
                    <option value="studio backdrop">Studio backdrop</option>
                    <option value="dark luxury interior">Dark luxury interior</option>
                    <option value="clean neutral studio">Clean neutral studio</option>
                    <option value="outdoor cityscape">Outdoor cityscape</option>
                  </select>
                </label>

                <label className="field-group">
                  <span>Camera</span>
                  <select name="camera" value={form.camera} onChange={handleChange}>
                    <option value="eye-level">Eye level</option>
                    <option value="low angle">Low angle</option>
                    <option value="overhead">Overhead</option>
                    <option value="wide shot">Wide shot</option>
                  </select>
                </label>
              </div>

              <div className="two-column-fields">
                <label className="field-group">
                  <span>Subject focus</span>
                  <select name="subject" value={form.subject} onChange={handleChange}>
                    <option value="premium product">Premium product</option>
                    <option value="fashion portrait">Fashion portrait</option>
                    <option value="architectural detail">Architectural detail</option>
                    <option value="lifestyle scene">Lifestyle scene</option>
                  </select>
                </label>

                <label className="field-group">
                  <span>Quality</span>
                  <select name="quality" value={form.quality} onChange={handleChange}>
                    <option value="draft">Draft</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </label>
              </div>

              <div className="two-column-fields">
                <label className="field-group">
                  <span>Aspect ratio</span>
                  <select name="aspectRatio" value={form.aspectRatio} onChange={handleChange}>
                    <option value="16:9">16:9</option>
                    <option value="1:1">1:1</option>
                    <option value="4:5">4:5</option>
                    <option value="9:16">9:16</option>
                  </select>
                </label>

                <label className="field-group">
                  <span>Resolution</span>
                  <select name="resolution" value={form.resolution} onChange={handleChange}>
                    <option value="1024x1024">1024 × 1024</option>
                    <option value="1536x1024">1536 × 1024</option>
                    <option value="1024x1536">1024 × 1536</option>
                  </select>
                </label>
              </div>

              <div className="two-column-fields">
                <label className="field-group">
                  <span>Quality</span>
                  <select name="quality" value={form.quality} onChange={handleChange}>
                    <option value="draft">Draft</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </label>

                <label className="field-group">
                  <span>Count</span>
                  <select name="generationCount" value={form.generationCount} onChange={handleChange}>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </label>
              </div>

              {error ? <div className="form-message error">{error}</div> : null}

              <button type="submit" className="primary-button full-width" disabled={isGenerating}>
                {isGenerating ? 'Generating…' : 'Generate concept'}
              </button>
            </form>
          ) : (
            <form className="generation-form" onSubmit={handleVideoSubmit}>
              <label className="field-group">
                <span>Video prompt</span>
                <textarea
                  name="videoPrompt"
                  value={videoForm.prompt}
                  onChange={(event) => setVideoForm((current) => ({ ...current, prompt: event.target.value }))}
                  rows="5"
                  required
                />
              </label>

              <div className="two-column-fields">
                <label className="field-group">
                  <span>Model</span>
                  <select
                    value={videoForm.model}
                    onChange={(event) => setVideoForm((current) => ({ ...current, model: event.target.value }))}
                  >
                    <option value="gen3">Gen 3</option>
                    <option value="motion">Motion</option>
                    <option value="cinematic">Cinematic</option>
                  </select>
                </label>

                <label className="field-group">
                  <span>Duration</span>
                  <select
                    value={videoForm.duration}
                    onChange={(event) => setVideoForm((current) => ({ ...current, duration: Number(event.target.value) }))}
                  >
                    <option value={4}>4s</option>
                    <option value={8}>8s</option>
                    <option value={12}>12s</option>
                    <option value={16}>16s</option>
                  </select>
                </label>
              </div>

              <div className="two-column-fields">
                <label className="field-group">
                  <span>Aspect ratio</span>
                  <select
                    value={videoForm.aspectRatio}
                    onChange={(event) => setVideoForm((current) => ({ ...current, aspectRatio: event.target.value }))}
                  >
                    <option value="16:9">16:9</option>
                    <option value="9:16">9:16</option>
                    <option value="1:1">1:1</option>
                  </select>
                </label>

                <label className="field-group">
                  <span>Resolution</span>
                  <select
                    value={videoForm.resolution}
                    onChange={(event) => setVideoForm((current) => ({ ...current, resolution: event.target.value }))}
                  >
                    <option value="1920x1080">1920 × 1080</option>
                    <option value="1280x720">1280 × 720</option>
                    <option value="1024x576">1024 × 576</option>
                  </select>
                </label>
              </div>

              {error ? <div className="form-message error">{error}</div> : null}

              <button type="submit" className="primary-button full-width" disabled={isGenerating}>
                {isGenerating ? 'Preparing…' : 'Generate video'}
              </button>
            </form>
          )}
        </section>

        <aside className="results-panel">
          <div className="panel-header results-header">
            <div>
              <p className="eyebrow">Latest results</p>
              <h2>Campaign outputs</h2>
            </div>
          </div>

          {isLoading ? (
            <div className="state-box">Loading your image history…</div>
          ) : !selectedMedia.length ? (
            <div className="state-box">No generations yet. Build a concept to populate this space.</div>
          ) : (
            <>
              <div className="featured-output">
                {isVideoGeneration ? (
                  <video controls src={featuredOutput?.url} poster={featuredOutput?.thumbnailUrl || featuredOutput?.url} />
                ) : (
                  <img src={featuredOutput?.url} alt={featuredOutput?.prompt || 'Generated output'} />
                )}
              </div>

              <div className="result-grid">
                {selectedMedia.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`result-thumb ${selectedOutputId === item.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedGenerationId(currentGeneration.id);
                      setSelectedOutputId(item.id);
                    }}
                    aria-label="Select output"
                  >
                    {isVideoGeneration ? (
                      <video controls src={item.url} poster={item.thumbnailUrl || item.url} />
                    ) : (
                      <img src={item.url} alt="Generated visual" />
                    )}
                  </button>
                ))}
              </div>

              <div className="result-actions">
                {featuredOutput ? (
                  <a
                    className="secondary-button result-link"
                    href={featuredOutput.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open full size
                  </a>
                ) : null}

                {currentGeneration ? (
                  <button type="button" className="ghost-button" onClick={() => handleRegenerate(currentGeneration.id)}>
                    Regenerate
                  </button>
                ) : null}
              </div>
            </>
          )}
        </aside>
      </div>

      <section className="history-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">History</p>
            <h2>Recent concepts</h2>
          </div>
        </div>

        <div className="history-grid">
          {generations.length ? (
            generations.slice(0, 6).map((generation) => (
              <article key={generation.id} className="history-card" onClick={() => {
                setSelectedGenerationId(generation.id);
                setSelectedOutputId(resolveSelectedOutputId(generation));
              }}>
                {generation.type === 'video' ? (
                  <video
                    src={generation.outputs?.[0]?.url}
                    poster={generation.outputs?.[0]?.thumbnailUrl || generation.outputs?.[0]?.url}
                    muted
                    playsInline
                  />
                ) : (
                  <img src={generation.outputs?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'} alt={generation.prompt} />
                )}
                <div className="history-content">
                  <strong>{generation.model}</strong>
                  <p>{generation.prompt}</p>
                  <span>{generation.type === 'video' ? 'Video generation' : 'Image generation'} · {new Date(generation.createdAt).toLocaleDateString()}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="state-box">Your generation timeline will appear here once you create a concept.</div>
          )}
        </div>
      </section>
    </div>
  );
}
