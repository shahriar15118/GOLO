import jwt from 'jsonwebtoken';
import { error } from '../utils/response.js';
import { supabase } from '../lib/supabase.js';

export const authGuard = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return error(res, 'Authorization header missing or invalid', 401);
  }

  const token = authHeader.split(' ')[1];
  
  if (!token || token === 'undefined' || token === 'null') {
    return error(res, 'Token missing or invalid format', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'default_access_secret');
    
    // Check if user still exists in Supabase
    const { data: user, error: supabaseError } = await supabase
      .from('users')
      .select('id, role, token_version')
      .eq('id', decoded.id)
      .single();

    if (supabaseError || !user) {
      return error(res, 'User record not found or vault connection error', 401);
    }

    if (user.token_version !== decoded.version) {
      return error(res, 'Session invalidated (remote logout)', 401);
    }
    
    req.user = {
        ...decoded,
        role: user.role // Use the most up-to-date role from DB
    };
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired', 401);
    }
    return error(res, 'Token invalid: ' + err.message, 401);
  }
};

export const roleGuard = (role) => (req, res, next) => {
  if (req.user.role !== role && req.user.role !== 'admin') {
    return error(res, 'Forbidden: Insufficient permissions', 403);
  }
  next();
};
