import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

export const hashPassword = (password) => bcryptjs.hash(password, 10);

export const verifyPassword = (password, hash) => bcryptjs.compare(password, hash);

export const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.jwtSecret,
    { expiresIn: config.sessionTtl },
  );

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
};
