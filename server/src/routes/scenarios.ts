/**
 * Scenario Routes
 * ==============
 * All routes related to scenario management
 * 
 * All routes require authentication (Bearer token)
 * Users can only access/modify their own scenarios
 * 
 * Routes:
 * - POST /api/scenarios - Create scenario
 * - GET /api/scenarios - Get all user's scenarios
 * - GET /api/scenarios/:id - Get specific scenario
 * - PUT /api/scenarios/:id - Update scenario
 * - DELETE /api/scenarios/:id - Delete scenario
 * - PATCH /api/scenarios/:id/toggle - Toggle active status
 */

import { Router } from 'express';
import {
  createScenario,
  getScenarios,
  getScenarioById,
  updateScenario,
  deleteScenario,
  toggleScenarioActive,
} from '../controllers/scenarioController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

/**
 * All scenario routes require authentication
 * Middleware ensures user is logged in before accessing any route
 */
router.use(protect);

/**
 * POST /api/scenarios
 * Create a new scenario
 * 
 * Body:
 * {
 *   title: string,
 *   description?: string,
 *   type: string,
 *   parameters?: object
 * }
 */
router.post('/', createScenario);

/**
 * GET /api/scenarios
 * Get all scenarios for the logged-in user
 * 
 * Query parameters (optional):
 * - isActive: boolean
 * - type: string
 * - sort: 'newest' | 'oldest'
 * 
 * Example: GET /api/scenarios?isActive=true&sort=newest
 */
router.get('/', getScenarios);

/**
 * GET /api/scenarios/:id
 * Get a specific scenario by ID
 * 
 * Params:
 * - id: MongoDB ObjectId of scenario
 */
router.get('/:id', getScenarioById);

/**
 * PUT /api/scenarios/:id
 * Update a scenario (all fields)
 * 
 * Params:
 * - id: MongoDB ObjectId
 * 
 * Body:
 * {
 *   title?: string,
 *   description?: string,
 *   type?: string,
 *   parameters?: object
 * }
 */
router.put('/:id', updateScenario);

/**
 * DELETE /api/scenarios/:id
 * Delete a scenario permanently
 * 
 * Params:
 * - id: MongoDB ObjectId
 */
router.delete('/:id', deleteScenario);

/**
 * PATCH /api/scenarios/:id/toggle
 * Toggle scenario active/inactive status
 * 
 * Params:
 * - id: MongoDB ObjectId
 * 
 * Toggles isActive: true → false, false → true
 */
router.patch('/:id/toggle', toggleScenarioActive);

export default router;
