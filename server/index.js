import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { hashPassword, signToken, verifyPassword, verifyToken } from './auth.js';
import { userRepository } from './repositories/userRepository.js';
import { GenerationService } from './services/GenerationService.js';

const app = express();
const generationService = new GenerationService();

if (config.isProduction && !config.useSupabase) {
  throw new Error('Production requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Local JSON fallback is not allowed in production.');
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed = !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin);

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired session.' });
  }

  req.user = decoded;
  next();
};

const sendError = (res, status, message) => res.status(status).json({ message });

const normalizeUser = ({ id, name, email }) => ({ id, name, email });

const isStrongPassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(String(value || ''));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'higgsfield-api' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body || {};

    if (!name || !email || !password || !confirmPassword) {
      return sendError(res, 400, 'Name, email, password, and confirm password are required.');
    }

    if (!isStrongPassword(password)) {
      return sendError(
        res,
        400,
        'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
      );
    }

    if (password !== confirmPassword) {
      return sendError(res, 400, 'Passwords do not match.');
    }

    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
      return sendError(res, 409, 'An account with that email already exists.');
    }

    const user = await userRepository.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: await hashPassword(password),
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: normalizeUser(user),
      message: 'Registration successful.',
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Registration failed.');
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, remember } = req.body || {};

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required.');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const valid = await verifyPassword(password, user.password || user.passwordHash || '');
    if (!valid) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const token = signToken(user);
    res.json({
      token,
      user: normalizeUser(user),
      remember: Boolean(remember),
      message: 'Login successful.',
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Login failed.');
  }
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    return res.json({ user: normalizeUser(user) });
  } catch (error) {
    return sendError(res, 500, error.message || 'Unable to load user account.');
  }
});

const normalizeStylePreset = (value) => {
  const allowed = new Set([
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

  return allowed.has(value) ? value : 'cinematic';
};

const parseGenerationRequest = (body) => {
  const type = body.type === 'video' ? 'video' : 'image';
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    throw new Error('Prompt is required.');
  }

  const styleSettings = {
    lighting: typeof body.lighting === 'string' ? body.lighting : 'soft dramatic',
    mood: typeof body.mood === 'string' ? body.mood : 'luxury',
    background: typeof body.background === 'string' ? body.background : 'studio backdrop',
    camera: typeof body.camera === 'string' ? body.camera : 'eye-level',
    subject: typeof body.subject === 'string' ? body.subject : '',
    ...(body.styleSettings || {}),
  };

  return {
    prompt,
    type,
    negativePrompt: typeof body.negativePrompt === 'string' ? body.negativePrompt.trim() : '',
    referenceImage: typeof body.referenceImage === 'string' ? body.referenceImage : '',
    model: body.model || (type === 'video' ? 'gen3' : 'cinematic'),
    preset: normalizeStylePreset(body.preset || 'cinematic'),
    aspectRatio: body.aspectRatio || '16:9',
    resolution: body.resolution || (type === 'video' ? '1920x1080' : '1024x1024'),
    quality: body.quality || 'high',
    duration: body.duration ?? (type === 'video' ? 8 : null),
    generationCount: Math.min(Math.max(Number(body.generationCount || 1), 1), 4),
    styleSettings,
  };
};

app.post('/api/generations', authMiddleware, async (req, res) => {
  try {
    const request = parseGenerationRequest(req.body || {});
    const result = await generationService.submitGeneration({
      userId: Number(req.user.id),
      type: request.type,
      ...request,
    });

    return res.status(201).json({
      generation: result.generation || result,
      message: result.message || 'Generation started successfully.',
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Unable to start generation.');
  }
});

app.get('/api/generations/:id', authMiddleware, async (req, res) => {
  try {
    const item = await generationService.getGenerationById(Number(req.user.id), Number(req.params.id));
    if (!item) {
      return sendError(res, 404, 'Generation not found.');
    }
    return res.json({ generation: item });
  } catch (error) {
    return sendError(res, 500, error.message || 'Unable to load generation.');
  }
});

app.get('/api/generations', authMiddleware, async (req, res) => {
  try {
    const items = await generationService.listGenerationsByUser(Number(req.user.id));
    const sorted = [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return res.json({ generations: sorted });
  } catch (error) {
    return sendError(res, 500, error.message || 'Unable to load your generations.');
  }
});

app.post('/api/generations/:id/regenerate', authMiddleware, async (req, res) => {
  try {
    const existing = await generationService.getGenerationById(Number(req.user.id), Number(req.params.id));
    if (!existing) {
      return sendError(res, 404, 'Generation not found.');
    }

    const request = {
      prompt: existing.prompt,
      negativePrompt: existing.negativePrompt || '',
      model: existing.model,
      aspectRatio: existing.aspectRatio || '16:9',
      resolution: existing.resolution || '1024x1024',
      generationCount: existing.generationCount || existing.settings?.generationCount || 1,
      duration: existing.duration ?? null,
      settings: existing.settings || {},
    };

    const result = await generationService.submitGeneration({
      userId: Number(req.user.id),
      type: existing.type === 'video' ? 'video' : 'image',
      ...request,
    });

    return res.json({
      generation: result.generation || result,
      message: result.message || 'Generation refreshed.',
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Unable to regenerate the image.');
  }
});

app.use((err, _req, res) => {
  console.error(err);
  return sendError(res, 500, 'Internal server error.');
});

app.listen(config.port, () => {
  console.log(`Higgsfield API running on http://localhost:${config.port}`);
});
