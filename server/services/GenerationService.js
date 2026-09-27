import { generationRepository } from '../repositories/generationRepository.js';
import { ImageGenerationProvider } from '../providers/imageProvider.js';
import { VideoGenerationProvider } from '../providers/videoProvider.js';

export class GenerationService {
  constructor() {
    this.imageProvider = ImageGenerationProvider.create();
    this.videoProvider = new VideoGenerationProvider();
  }

  buildCreativePrompt(prompt, { model, preset, styleSettings = {} } = {}) {
    const parts = [prompt?.trim()].filter(Boolean);
    const styleParts = [];

    if (styleSettings.lighting) styleParts.push(`${styleSettings.lighting} lighting`);
    if (styleSettings.mood) styleParts.push(styleSettings.mood);
    if (styleSettings.background) styleParts.push(`background: ${styleSettings.background}`);
    if (styleSettings.camera) styleParts.push(`camera angle: ${styleSettings.camera}`);
    if (styleSettings.subject) styleParts.push(styleSettings.subject);
    if (preset) styleParts.push(preset);
    if (model) styleParts.push(model);

    return [...new Set([...parts, ...styleParts])].join(', ');
  }

  async submitGeneration({ userId, type = 'image', ...payload }) {
    const provider = type === 'video' ? this.videoProvider : this.imageProvider;
    const settings = {
      ...(payload.settings || {}),
      referenceImage: payload.referenceImage || payload.settings?.referenceImage || null,
      generationCount: payload.generationCount || payload.count || 1,
    };

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
      settings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const enrichedPrompt = type === 'video'
      ? payload.prompt
      : this.buildCreativePrompt(payload.prompt, {
          model: payload.model,
          preset: payload.preset,
          styleSettings: payload.styleSettings || {},
        });

    const providerResult = await provider.submit({
      ...payload,
      prompt: enrichedPrompt,
      referenceImage: payload.referenceImage || null,
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

    const providerName = providerResult.provider || 'demo';
    const sourceMessage = providerName === 'stability'
      ? 'Using Stability AI for this generation.'
      : (providerResult.message || 'No Stability API key found. Demo generation is active.');

    return {
      generation: {
        ...finalRecord,
        outputs: normalizedOutputs,
        selectedOutput: normalizedOutputs[0] || null,
        provider: providerName,
      },
      message: sourceMessage,
      provider: providerName,
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
