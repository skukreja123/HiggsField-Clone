import { BaseGenerationProvider } from './baseProvider.js';

const sampleResults = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
];

export class DemoImageProvider extends BaseGenerationProvider {
  async generate({ prompt, negativePrompt, aspectRatio, resolution, count = 1 }) {
    const outputs = Array.from({ length: Math.max(1, Number(count) || 1) }, (_, index) => ({
      id: `demo-${Date.now()}-${index}`,
      url: sampleResults[index % sampleResults.length],
      prompt,
      negativePrompt,
      aspectRatio,
      resolution,
      seed: Math.floor(Math.random() * 100000),
    }));

    return {
      status: 'completed',
      outputs,
      provider: 'demo',
      message: 'Demo generation completed successfully.',
    };
  }

  async submit(payload) {
    return this.generate(payload);
  }

  async getStatus() {
    return { status: 'completed', provider: 'demo' };
  }

  async getResult() {
    return { status: 'completed', provider: 'demo' };
  }

  async retry(generationId) {
    return { id: generationId, status: 'completed', provider: 'demo', retried: true };
  }

  normalizeResult(result) {
    return result;
  }
}
