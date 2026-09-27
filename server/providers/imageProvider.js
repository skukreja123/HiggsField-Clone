import { DemoImageProvider } from './demoProvider.js';
import { config } from '../config.js';
import { BaseGenerationProvider } from './baseProvider.js';

export class ImageGenerationProvider extends BaseGenerationProvider {
  static create() {
    const provider = config.imageProvider;

    if (provider === 'stability' && config.stabilityApiKey) {
      return new StabilityImageProvider();
    }

    return new DemoImageProvider();
  }
}

export class StabilityImageProvider extends BaseGenerationProvider {
  constructor() {
    super();
    this.apiKey = config.stabilityApiKey;
    this.baseUrl = config.stabilityApiUrl;
  }

  async submit(payload) {
    const fallback = (reason = 'No Stability API key found. Demo generation is active.') => ({
      ...new DemoImageProvider().submit(payload),
      provider: 'demo',
      message: reason,
    });

    if (!this.apiKey) {
      return fallback();
    }

    const allowedStyles = new Set([
      'enhance',
      'anime',
      'photographic',
      'digital-art',
      'comic-book',
      'fantasy-art',
      'line-art',
      'analog-film',
      'neon-punk',
      'isometric',
      'low-poly',
      'origami',
      'modeling-compound',
      'cinematic',
      '3d-model',
      'pixel-art',
      'tile-texture',
    ]);

    const fallback = () => new DemoImageProvider().submit(payload);

    try {
      const formData = new FormData();
      formData.append('prompt', payload.prompt || '');
      formData.append('negative_prompt', payload.negativePrompt || '');
      formData.append('aspect_ratio', payload.aspectRatio || '1:1');
      formData.append('style_preset', allowedStyles.has(payload.preset) ? payload.preset : 'cinematic');
      formData.append('output_format', 'png');
      formData.append('samples', String(payload.count || 1));

      const width = payload.width || Number((payload.resolution || '1024x1024').split('x')[0]) || 1024;
      const height = payload.height || Number((payload.resolution || '1024x1024').split('x')[1]) || 1024;
      formData.append('width', String(width));
      formData.append('height', String(height));

      const response = await fetch(`${this.baseUrl}/v2beta/stable-image/generate/core`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        const message = text || response.statusText || '';
        if (response.status === 402 || response.status === 401 || response.status === 403 || response.status === 429 || /credit|payment|insufficient/i.test(message)) {
          return fallback('Stability API rejected the request or ran out of credits. Demo generation is active.');
        }
        throw new Error(`Provider request failed: ${response.status} ${message}`);
      }

      const data = await response.json();
      const artifacts = Array.isArray(data.artifacts) ? data.artifacts : [data];
      const outputs = artifacts.map((artifact, index) => {
        const base64 = artifact.base64 || artifact.image || artifact.url || '';
        const url = base64.startsWith('data:') ? base64 : base64 ? `data:image/png;base64,${base64}` : '';

        return {
          id: artifact.seed || `stability-${Date.now()}-${index}`,
          url,
          thumbnailUrl: url,
        };
      }).filter((output) => output.url);

      if (!outputs.length) {
        return fallback();
      }

      return {
        status: 'completed',
        provider: 'stability',
        outputs,
      };
    } catch (error) {
      const message = String(error?.message || '');
      if (/credit|payment|insufficient|402|401|403|429|fetch/i.test(message)) {
        return fallback('Stability API is unavailable. Demo generation is active.');
      }
      throw error;
    }
  }

  async getStatus() {
    return { status: 'completed', provider: 'stability' };
  }

  async getResult() {
    return { status: 'completed', provider: 'stability' };
  }

  async retry(generationId) {
    return { id: generationId, status: 'queued', provider: 'stability', retried: true };
  }
}
