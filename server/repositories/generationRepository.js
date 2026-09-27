import { supabase } from '../db/supabase.js';
import { storage, nextId } from '../storage.js';

const isSupabaseReady = () => Boolean(supabase);

const normalizeGeneration = (row) => ({
  id: row.id,
  userId: row.user_id ?? row.userId,
  type: row.type,
  prompt: row.prompt,
  negativePrompt: row.negative_prompt ?? row.negativePrompt ?? '',
  model: row.model,
  aspectRatio: row.aspect_ratio ?? row.aspectRatio,
  resolution: row.resolution,
  duration: row.duration ?? null,
  status: row.status,
  settings: row.settings || {},
  outputs: row.outputs || [],
  selectedOutput: row.selectedOutput || null,
  createdAt: row.created_at ?? row.createdAt,
  updatedAt: row.updated_at ?? row.updatedAt,
});

const normalizeResult = (row) => ({
  id: row.id,
  generationId: row.generation_id,
  type: row.type,
  assetUrl: row.asset_url,
  thumbnailUrl: row.thumbnail_url,
  metadata: row.metadata || {},
  createdAt: row.created_at,
});

const getLegacyRecords = () => storage.getGenerations();

const saveLegacyRecords = (records) => storage.saveGenerations(records);

const buildLegacyGeneration = (generation) => ({
  id: generation.id,
  userId: generation.userId,
  type: generation.type || 'image',
  prompt: generation.prompt,
  negativePrompt: generation.negativePrompt || '',
  model: generation.model,
  preset: generation.preset || 'premium',
  aspectRatio: generation.aspectRatio || '16:9',
  resolution: generation.resolution || '1024x1024',
  quality: generation.quality || 'high',
  generationCount: generation.generationCount || 1,
  styleSettings: generation.styleSettings || {},
  duration: generation.duration ?? null,
  status: generation.status || 'queued',
  outputs: generation.outputs || [],
  selectedOutput: generation.selectedOutput || (generation.outputs || [])[0] || null,
  createdAt: generation.createdAt || new Date().toISOString(),
  updatedAt: generation.updatedAt || new Date().toISOString(),
});

export const generationRepository = {
  async listByUser(userId) {
    if (!isSupabaseReady()) {
      const items = getLegacyRecords()
        .filter((generation) => generation.userId === Number(userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return items.map((item) => normalizeGeneration(item));
    }

    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const generations = await Promise.all((data || []).map(async (row) => {
      const results = await this.listResultsByGeneration(row.id);
      return normalizeGeneration({ ...row, outputs: results.map((result) => ({
        id: result.id,
        url: result.assetUrl,
        thumbnailUrl: result.thumbnailUrl,
        type: result.type,
        metadata: result.metadata,
      })), selectedOutput: (results[0] || null)?.assetUrl || null });
    }));

    return generations;
  },

  async getById(id, userId) {
    if (!isSupabaseReady()) {
      const item = getLegacyRecords().find((generation) => generation.id === Number(id) && generation.userId === Number(userId));
      return item ? normalizeGeneration(item) : null;
    }

    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const results = await this.listResultsByGeneration(data.id);
    return normalizeGeneration({
      ...data,
      outputs: results.map((result) => ({
        id: result.id,
        url: result.assetUrl,
        thumbnailUrl: result.thumbnailUrl,
        type: result.type,
        metadata: result.metadata,
      })),
      selectedOutput: (results[0] || null)?.assetUrl || null,
    });
  },

  async create(generation) {
    if (!isSupabaseReady()) {
      const record = buildLegacyGeneration({
        ...generation,
        id: nextId(getLegacyRecords()),
        status: generation.status || 'queued',
        createdAt: generation.createdAt || new Date().toISOString(),
        updatedAt: generation.updatedAt || new Date().toISOString(),
      });
      const records = getLegacyRecords();
      records.push(record);
      saveLegacyRecords(records);
      return normalizeGeneration(record);
    }

    const payload = {
      user_id: generation.userId,
      type: generation.type || 'image',
      prompt: generation.prompt,
      negative_prompt: generation.negativePrompt || '',
      model: generation.model,
      aspect_ratio: generation.aspectRatio,
      resolution: generation.resolution,
      duration: generation.duration ?? null,
      status: generation.status || 'queued',
      settings: generation.settings || {},
    };

    const { data, error } = await supabase
      .from('generations')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return normalizeGeneration({ ...data, outputs: [], selectedOutput: null });
  },

  async update(id, updates) {
    if (!isSupabaseReady()) {
      const records = getLegacyRecords();
      const index = records.findIndex((item) => item.id === Number(id));
      if (index < 0) return null;

      const merged = {
        ...records[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      records[index] = merged;
      saveLegacyRecords(records);
      return normalizeGeneration(merged);
    }

    const { data, error } = await supabase
      .from('generations')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data ? normalizeGeneration(data) : null;
  },

  async saveResult(generationId, result) {
    if (!isSupabaseReady()) {
      const records = getLegacyRecords();
      const target = records.find((item) => item.id === Number(generationId));
      if (!target) return null;

      const outputs = Array.isArray(result.outputs) ? result.outputs : [];
      target.status = result.status || 'completed';
      target.outputs = outputs;
      target.selectedOutput = outputs[0] || null;
      target.updatedAt = new Date().toISOString();
      saveLegacyRecords(records);
      return normalizeGeneration(target);
    }

    const outputs = Array.isArray(result.outputs) ? result.outputs : [];
    const inserted = await Promise.all(outputs.map((item) => this.saveResultRow(generationId, {
      type: result.type || 'image',
      assetUrl: item.url || item.assetUrl,
      thumbnailUrl: item.thumbnailUrl || item.url,
      metadata: {
        ...item,
        prompt: result.prompt,
      },
    })));

    if (inserted.length) {
      await this.update(generationId, {
        status: result.status || 'completed',
        updated_at: new Date().toISOString(),
      });
    }

    return inserted;
  },

  async saveResultRow(generationId, result) {
    if (!isSupabaseReady()) {
      return null;
    }

    const { data, error } = await supabase.from('generation_results').insert({
      generation_id: generationId,
      type: result.type,
      asset_url: result.assetUrl,
      thumbnail_url: result.thumbnailUrl,
      metadata: result.metadata || {},
    }).select('*').single();

    if (error) throw error;
    return normalizeResult(data);
  },

  async listResultsByGeneration(generationId) {
    if (!isSupabaseReady()) {
      const generation = getLegacyRecords().find((item) => item.id === Number(generationId));
      return Array.isArray(generation?.outputs) ? generation.outputs.map((output) => ({
        id: output.id,
        generation_id: generationId,
        type: 'image',
        asset_url: output.url,
        thumbnail_url: output.thumbnailUrl || output.url,
        metadata: output.metadata || {},
        created_at: generation.createdAt,
      })) : [];
    }

    const { data, error } = await supabase
      .from('generation_results')
      .select('*')
      .eq('generation_id', generationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(normalizeResult);
  },
};
