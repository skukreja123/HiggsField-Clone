import { generationRepository } from '../repositories/generationRepository.js';
import { ImageGenerationProvider } from '../providers/imageProvider.js';
import { VideoGenerationProvider } from '../providers/videoProvider.js';

export class GenerationService {
  constructor() {
    this.imageProvider = ImageGenerationProvider.create();
    this.videoProvider = new VideoGenerationProvider();
  }

  async submitGeneration({ userId, type = 'image', ...payload }) {
    const provider = type === 'video' ? this.videoProvider : this.imageProvider;

    const generation = await generationRepository.create({
      userId,
      type,
      prompt: payload.prompt,
      negativePrompt: payload.negativePrompt || '',
      model: payload.model || 'cinematic',
      aspectRatio: payload.aspectRatio || '16:9',
      resolution: payload.resolution || '1024x1024',
      duration: payload.duration ?? null,
      status: 'queued',
      settings: payload.settings || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const providerResult = await provider.submit({
      ...payload,
      count: payload.generationCount || payload.count || 1,
      duration: payload.duration,
      type,
    });

    const normalizedOutputs = (providerResult.outputs || []).map((output) => ({
      id: output.id || `${generation.id}-${Math.random().toString(16).slice(2)}`,
      url: output.url,
      thumbnailUrl: output.thumbnailUrl || output.url,
      type: type === 'video' ? 'video' : 'image',
      metadata: {
        prompt: payload.prompt,
        negativePrompt: payload.negativePrompt || '',
        ...output,
      },
    }));

    const finalRecord = await generationRepository.update(generation.id, {
      status: providerResult.status || 'completed',
      updatedAt: new Date().toISOString(),
    });

    if (normalizedOutputs.length) {
      await Promise.all(normalizedOutputs.map((output) => generationRepository.saveResultRow(generation.id, {
        type: output.type,
        assetUrl: output.url,
        thumbnailUrl: output.thumbnailUrl,
        metadata: output.metadata,
      })));
    }

    return {
      generation: {
        ...finalRecord,
        outputs: normalizedOutputs,
        selectedOutput: normalizedOutputs[0] || null,
      },
      message: `${type === 'video' ? 'Video' : 'Image'} generation completed successfully.`,
    };
  }

  async listGenerationsByUser(userId) {
    return generationRepository.listByUser(userId);
  }

  async getGenerationById(userId, id) {
    return generationRepository.getById(id, userId);
  }

  async retryGeneration(type, generationId) {
    const provider = type === 'video' ? this.videoProvider : this.imageProvider;
    return provider.retry(generationId);
  }
}
