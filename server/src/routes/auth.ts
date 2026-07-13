/**
 * Authentication Routes
 * =====================
 * Maps HTTP endpoints to controller functions
 * 
 * How it works:
 * 1. Frontend sends POST request to /api/auth/login (or /register)
 * 2. Express matches route in this file
 * 3. Calls corresponding controller function from authController.ts
 * 4. Controller processes request and sends response
 */

import { Router } from 'express';
import { register, login, verify } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

/**
 * POST /api/auth/register
 * Frontend sends: { name, email, password, role }
 * Controller returns: { _id, name, email, role, token }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Frontend sends: { email, password }
 * Controller returns: { _id, name, email, role, token }
 */
router.post('/login', login);

/**
 * GET /api/auth/verify
 * Frontend sends: Authorization header with JWT token
 * Controller verifies token and returns fresh user data
 * Used on app initialization to restore user session after page refresh
 */
router.get('/verify', protect, verify);

export default router;