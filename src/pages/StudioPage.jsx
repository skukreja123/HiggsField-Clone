import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const defaultForm = {
  prompt: 'Cinematic luxury product shot of a premium watch resting on dark velvet with soft gold highlights and dramatic studio lighting.',
  negativePrompt: 'blurry, low detail, distorted product, text, watermark',
  model: 'cinematic',
  preset: 'premium',
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
  const [selectedId, setSelectedId] = useState(null);

  const currentGeneration = useMemo(
    () => generations.find((item) => item.id === selectedId) || generations[0] || null,
    [generations, selectedId],
  );

  const fetchGenerations = async () => {
    try {
      const response = await apiRequest('/generations');
      setGenerations(response.generations || []);
      if (response.generations?.length) {
        setSelectedId((current) => current || response.generations[0].id);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsGenerating(true);

    try {
      const response = await apiRequest('/generations', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setSelectedId(response.generation?.id || null);
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

      setSelectedId(response.generation?.id || null);
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

  const selectedMedia = currentGeneration?.outputs || [];
  const isVideoGeneration = currentGeneration?.type === 'video';

  return (
    <div className="studio-page-shell">
      <header className="studio-topbar">
        <div>
          <p className="eyebrow">Creative dashboard</p>
          <h1>Welcome back, {user?.name || 'creator'}.</h1>
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
                    <option value="premium">Premium</option>
                    <option value="minimal">Minimal</option>
                    <option value="moody">Moody</option>
                    <option value="vivid">Vivid</option>
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
                  <video controls src={selectedMedia[0]?.url} poster={selectedMedia[0]?.thumbnailUrl || selectedMedia[0]?.url} />
                ) : (
                  <img src={selectedMedia[0]?.url} alt={selectedMedia[0]?.prompt || 'Generated output'} />
                )}
              </div>

              <div className="result-grid">
                {selectedMedia.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`result-thumb ${currentGeneration?.selectedOutput?.id === item.id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(currentGeneration.id)}
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
                {selectedMedia[0] ? (
                  <a
                    className="secondary-button result-link"
                    href={selectedMedia[0].url}
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
              <article key={generation.id} className="history-card" onClick={() => setSelectedId(generation.id)}>
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
