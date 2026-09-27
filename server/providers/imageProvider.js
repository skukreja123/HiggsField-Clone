import { DemoImageProvider } from './demoProvider.js';
import { config } from '../config.js';
import { BaseGenerationProvider } from './baseProvider.js';

export class ImageGenerationProvider extends BaseGenerationProvider {
  static create() {
    const provider = config.imageProvider;

    if (provider === 'stability') {
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
    if (!this.apiKey) {
      throw new Error('Stability API key is not configured.');
    }

    const response = await fetch(`${this.baseUrl}/v2beta/stable-image/generate/core`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: payload.prompt,
        negative_prompt: payload.negativePrompt || '',
        width: payload.width || 1024,
        height: payload.height || 1024,
        samples: payload.count || 1,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Provider request failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    return {
      status: 'completed',
      provider: 'stability',
      outputs: Array.isArray(data.artifacts) ? data.artifacts.map((artifact) => ({
        id: artifact.seed || crypto.randomUUID(),
        url: artifact.base64 || artifact.url || '',
      })) : [],
    };
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
