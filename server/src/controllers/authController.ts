/**
 * Authentication Controller
 * =========================
 * Backend business logic for login and registration.
 * 
 * Communication Flow (Backend):
 * Frontend (api.ts) → Server (index.ts) → Routes (auth.ts) → THIS FILE (authController)
 * ↓
 * Database (User model) → Returns user data
 * ↓
 * Generate JWT token → Send response back to frontend
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

/**
 * Generate JWT Token
 * ------------------
 * Creates a signed JWT token that client stores and sends with each request
 * Token expires in 7 days
 */
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });
};

/**
 * Register Controller
 * ------------------
 * Handles POST /api/auth/register
 * 
 * Flow:
 * 1. Receives: name, email, password, role from frontend
 * 2. Checks if email already exists in database
 * 3. Hashes password with bcrypt (never store plain text!)
 * 4. Creates new user in database
 * 5. Generates JWT token
 * 6. Sends back: _id, name, email, role, token
 * 7. Frontend stores in localStorage and Redux
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;
  try {
    // Check if email already registered
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }
    
    // Hash password before storing (security)
    const hashed = await bcrypt.hash(password, 10);
    
    // Create user in database
    const user = await User.create({ name, email, password: hashed, role });
    
    // Send back user data + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Login Controller
 * ---------------
 * Handles POST /api/auth/login
 * 
 * Flow:
 * 1. Receives: email, password from frontend
 * 2. Queries database for user with that email
 * 3. Compares provided password with hashed password using bcrypt
 * 4. If valid: generates JWT token and sends user data
 * 5. If invalid: sends 401 error
 * 6. Frontend stores token + user data in localStorage and Redux
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Compare provided password with stored hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Valid login - send back user data + token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Verify Token Controller
 * ----------------------
 * Handles GET /api/auth/verify
 * 
 * Flow:
 * 1. Frontend sends request with JWT token in Authorization header
 * 2. protect middleware validates the token (checks signature, expiration)
 * 3. If valid: middleware extracts user ID and sets it on req.user
 * 4. Controller fetches fresh user data from database
 * 5. Sends back user data (no new token needed - same token is still valid)
 * 6. Used on app initialization to restore user session on page refresh
 */
export const verify = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(401).json({ message: 'No user ID found' });
      return;
    }

    // Fetch fresh user data from database
    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Send back user data (reuse existing token)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: req.headers.authorization?.split(' ')[1] || '',
    });
  } catch (error) {
    res.status(401).json({ message: 'Token verification failed', error });
  }
};