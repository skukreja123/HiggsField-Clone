import { supabase } from '../db/supabase.js';
import { storage, nextId } from '../storage.js';

const isSupabaseReady = () => Boolean(supabase);

const normalizeUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  password: row.password || row.password_hash || null,
  createdAt: row.created_at || row.createdAt,
});

const getLegacyUsers = () => storage.getUsers();
const saveLegacyUsers = (users) => storage.saveUsers(users);

export const userRepository = {
  async findByEmail(email) {
    if (!isSupabaseReady()) {
      const user = getLegacyUsers().find((item) => String(item.email).toLowerCase() === String(email).trim().toLowerCase());
      return user ? normalizeUser(user) : null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', String(email).trim())
      .maybeSingle();

    if (error) throw error;
    return data ? normalizeUser(data) : null;
  },

  async findById(id) {
    if (!isSupabaseReady()) {
      const user = getLegacyUsers().find((item) => Number(item.id) === Number(id));
      return user ? normalizeUser(user) : null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', Number(id))
      .maybeSingle();

    if (error) throw error;
    return data ? normalizeUser(data) : null;
  },

  async create({ name, email, password }) {
    if (!isSupabaseReady()) {
      const users = getLegacyUsers();
      const user = {
        id: nextId(users),
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        password,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      saveLegacyUsers(users);
      return normalizeUser(user);
    }

    const { data, error } = await supabase
      .from('users')
      .insert({ name: String(name).trim(), email: String(email).trim().toLowerCase(), password_hash: password })
      .select('*')
      .single();

    if (error) throw error;
    return normalizeUser(data);
  },
};
