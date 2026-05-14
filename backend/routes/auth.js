import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { supabase } from '../lib/supabase.js';
import admin from '../lib/firebaseAdmin.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, version: user.token_version },
    process.env.JWT_ACCESS_SECRET || 'default_access_secret',
    { expiresIn: ACCESS_EXPIRES }
  );
  const refreshToken = jwt.sign(
    { id: user.id, version: user.token_version },
    process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    { expiresIn: REFRESH_EXPIRES }
  );
  return { accessToken, refreshToken };
};

router.post('/firebase-login', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return error(res, 'Token required', 400);

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    let user = existingUser;

    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          full_name: name || 'GOLO Member',
          email: email,
          password_hash: 'SOCIAL_LOGIN_PLACEHOLDER',
          avatar_url: picture || null,
          role: 'customer'
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      user = newUser;
    }

    const { accessToken, refreshToken } = generateTokens(user);
    delete user.password_hash;
    
    success(res, 'Social login successful', { user, token: accessToken, refreshToken });
  } catch (err) {
    console.error('Firebase token verification error:', err);
    error(res, 'Unauthorized social access', 401);
  }
});

router.post('/register', [
  body('full_name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return error(res, 'Validation failed', 400, errors.array());

  const { full_name, email, password } = req.body;
  
  try {
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return error(res, 'Email already in use', 400);

    const hash = bcrypt.hashSync(password, 12);
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ full_name, email, password_hash: hash, role: 'customer' }])
      .select()
      .single();

    if (insertError) throw insertError;
    
    const { accessToken, refreshToken } = generateTokens(newUser);
    delete newUser.password_hash;

    success(res, 'Registration successful', { user: newUser, accessToken, refreshToken }, 201);
  } catch (err) {
    error(res, err.message);
  }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const { data: user, error: supabaseError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (supabaseError || !user || !bcrypt.compareSync(password, user.password_hash)) {
      return error(res, 'Invalid credentials', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user);
    delete user.password_hash;
    
    success(res, 'Login successful', { user, accessToken, refreshToken });
  } catch (err) {
    error(res, err.message);
  }
});

router.get('/me', (req, res) => {
  success(res, 'User session', { user: req.user });
});

export default router;
