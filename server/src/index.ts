/**
 * Server Entry Point (Backend)
 * ============================
 * Sets up Express server that receives requests from frontend
 * 
 * Request Flow:
 * Frontend (via api.ts) → THIS FILE (Express setup) → Routes → Controllers → Database
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import scenarioRoutes from './routes/scenarios';
import pipelineRoutes from './routes/pipeline';
import alertRoutes from './routes/alerts';

// Connect to MongoDB database
connectDB();

const app = express();

// Enable CORS (allows frontend at different origin to make requests)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

/**
 * Route Handlers
 * 
 * Frontend sends to:
 * - POST /api/auth/login     → authController.login()
 * - POST /api/auth/register  → authController.register()
 * - GET/POST /api/user/*     → Protected routes (requires valid token)
 * - GET/POST /api/scenarios  → Scenario routes (requires valid token)
 */
app.use('/api/auth', authRoutes);
app.use('/api/user', protectedRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/alerts', alertRoutes);

// Health check endpoint
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));