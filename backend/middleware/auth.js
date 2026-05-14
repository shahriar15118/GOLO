import jwt from 'jsonwebtoken';
import { error } from '../utils/response.js';
import db from '../db.js';

export const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return error(res, 'Authorization header missing or invalid', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'default_access_secret');
    req.user = decoded;
    
    // Check if user still exists and token version matches
    const user = db.prepare('SELECT id, role, token_version FROM users WHERE id = ?').get(decoded.id);
    if (!user || user.token_version !== decoded.version) {
      return error(res, 'Token expired or invalid', 401);
    }
    
    next();
  } catch (err) {
    return error(res, 'Token invalid', 401);
  }
};

export const roleGuard = (role) => (req, res, next) => {
  if (req.user.role !== role && req.user.role !== 'admin') {
    return error(res, 'Forbidden: Insufficient permissions', 403);
  }
  next();
};
