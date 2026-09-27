import { BaseGenerationProvider } from './baseProvider.js';

const sampleResults = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
];

const categoryPools = {
  luxury: [
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
  ],
  product: [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
  ],
  fashion: [
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
  ],
  architecture: [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  ],
};

const pickFallbackPool = (prompt = '') => {
  const lowered = prompt.toLowerCase();
  if (/(watch|luxury|gold|product|premium)/.test(lowered)) return categoryPools.luxury;
  if (/(fashion|model|outfit|styling|dress|clothing)/.test(lowered)) return categoryPools.fashion;
  if (/(architecture|interior|room|home|building|villa)/.test(lowered)) return categoryPools.architecture;
  if (/(product|render|object|bottle|packaging|device)/.test(lowered)) return categoryPools.product;
  return sampleResults;
};

export class DemoImageProvider extends BaseGenerationProvider {
  async generate({ prompt, negativePrompt, aspectRatio, resolution, count = 1 }) {
    const basePool = pickFallbackPool(prompt);
    const shuffled = [...basePool].sort(() => Math.random() - 0.5);
    const outputs = Array.from({ length: Math.max(1, Number(count) || 1) }, (_, index) => ({
      id: `demo-${Date.now()}-${index}`,
      url: shuffled[index % shuffled.length],
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
