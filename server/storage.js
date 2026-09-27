import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const generationsFile = path.join(dataDir, 'generations.json');

const ensureFile = (filePath, fallback) => {
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
  }
};

ensureFile(usersFile, []);
ensureFile(generationsFile, []);

const readJson = (filePath) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeJson = (filePath, value) => {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
};

export const storage = {
  getUsers() {
    return readJson(usersFile);
  },
  saveUsers(users) {
    writeJson(usersFile, users);
  },
  getGenerations() {
    return readJson(generationsFile);
  },
  saveGenerations(generations) {
    writeJson(generationsFile, generations);
  },
};

export const nextId = (items) => {
  if (!items.length) return 1;
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
};
