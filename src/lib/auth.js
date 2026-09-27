const TOKEN_KEY = 'higgsfield_token';
const USER_KEY = 'higgsfield_user';

export const setSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getSession = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userString = localStorage.getItem(USER_KEY);

  if (!token) return null;

  try {
    return {
      token,
      user: userString ? JSON.parse(userString) : null,
    };
  } catch {
    return { token, user: null };
  }
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getAuthHeader = () => {
  const session = getSession();
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
};
