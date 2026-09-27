import { BaseGenerationProvider } from './baseProvider.js';

export class VideoGenerationProvider extends BaseGenerationProvider {
  constructor() {
    super();
    this.type = 'video';
  }

  async submit(payload) {
    const videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-resort-4446-large.mp4';

    return {
      id: `video-${Date.now()}`,
      type: 'video',
      status: 'completed',
      prompt: payload.prompt,
      model: payload.model || 'gen3',
      duration: payload.duration || 5,
      aspectRatio: payload.aspectRatio || '16:9',
      resolution: payload.resolution || '1280x720',
      outputs: [
        {
          id: `video-output-${Date.now()}`,
          url: videoUrl,
          thumbnailUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
          type: 'video',
        },
      ],
      metadata: {
        inputReference: payload.referenceImage || null,
        motion: payload.motion || 'cinematic',
      },
    };
  }

  async getStatus(generationId) {
    return {
      id: generationId,
      type: 'video',
      status: 'completed',
    };
  }

  async getResult(generationId) {
    return {
      id: generationId,
      type: 'video',
      outputs: [
        {
          id: `video-output-${generationId}`,
          url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-resort-4446-large.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
          type: 'video',
        },
      ],
    };
  }

  async retry(generationId) {
    return {
      id: generationId,
      type: 'video',
      status: 'queued',
      retried: true,
    };
  }
}
