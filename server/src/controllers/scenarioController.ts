/**
 * Scenario Controller
 * ==================
 * Handles all business logic for scenario management
 * 
 * Routes:
 * - POST /api/scenarios (create)
 * - GET /api/scenarios (read all)
 * - GET /api/scenarios/:id (read one)
 * - PUT /api/scenarios/:id (update)
 * - DELETE /api/scenarios/:id (delete)
 * - PATCH /api/scenarios/:id/toggle (toggle active status)
 */

import { Response } from 'express';
import Scenario, { IScenario } from '../models/Scenario';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * CREATE - POST /api/scenarios
 * 
 * Creates a new scenario for the logged-in user
 * 
 * Request body:
 * {
 *   title: string,
 *   description?: string,
 *   type: 'retirement' | 'investment' | 'debt-payoff' | 'savings' | 'custom',
 *   parameters: Record<string, any>
 * }
 * 
 * Response:
 * - 201: Created scenario document
 * - 400: Validation error
 * - 500: Server error
 */
export const createScenario = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, type, parameters } = req.body;
    const userId = req.user;

    // Validation
    if (!title || !type) {
      res.status(400).json({ message: 'Title and type are required' });
      return;
    }

    // Create new scenario
    const scenario = await Scenario.create({
      userId,
      title,
      description,
      type,
      parameters: parameters || {},
      isActive: true,
    });

    res.status(201).json(scenario);
  } catch (error: any) {
    console.error('Create scenario error:', error);
    res.status(500).json({ message: 'Failed to create scenario', error: error.message });
  }
};

/**
 * READ ALL - GET /api/scenarios
 * 
 * Retrieves all scenarios for the logged-in user
 * 
 * Query parameters (optional):
 * - isActive: boolean (filter by active status)
 * - type: string (filter by scenario type)
 * - sort: 'newest' | 'oldest' (sort by createdAt)
 * 
 * Response:
 * - 200: Array of scenario documents
 * - 500: Server error
 * 
 * Example:
 * GET /api/scenarios?isActive=true&type=retirement&sort=newest
 */
export const getScenarios = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user;
    const { isActive, type, sort } = req.query;

    // Build query filter
    const filter: any = { userId };

    // Add optional filters
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (type) {
      filter.type = type;
    }

    // Build sort option
    let sortOption: any = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    // Query database
    const scenarios = await Scenario.find(filter).sort(sortOption).exec();

    res.status(200).json(scenarios);
  } catch (error: any) {
    console.error('Get scenarios error:', error);
    res.status(500).json({ message: 'Failed to fetch scenarios', error: error.message });
  }
};

/**
 * READ ONE - GET /api/scenarios/:id
 * 
 * Retrieves a single scenario by ID
 * (user can only access their own scenarios)
 * 
 * Response:
 * - 200: Scenario document
 * - 403: Forbidden (not their scenario)
 * - 404: Not found
 * - 500: Server error
 */
export const getScenarioById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user;

    // Find scenario
    const scenario = await Scenario.findById(id);

    if (!scenario) {
      res.status(404).json({ message: 'Scenario not found' });
      return;
    }

    // Check ownership
    if (scenario.userId.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to access this scenario' });
      return;
    }

    res.status(200).json(scenario);
  } catch (error: any) {
    console.error('Get scenario by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch scenario', error: error.message });
  }
};

/**
 * UPDATE - PUT /api/scenarios/:id
 * 
 * Updates a scenario (all fields)
 * 
 * Request body:
 * {
 *   title?: string,
 *   description?: string,
 *   type?: string,
 *   parameters?: Record<string, any>
 * }
 * 
 * Response:
 * - 200: Updated scenario document
 * - 403: Forbidden
 * - 404: Not found
 * - 500: Server error
 */
export const updateScenario = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user;
    const { title, description, type, parameters } = req.body;

    // Find scenario
    const scenario = await Scenario.findById(id);

    if (!scenario) {
      res.status(404).json({ message: 'Scenario not found' });
      return;
    }

    // Check ownership
    if (scenario.userId.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to update this scenario' });
      return;
    }

    // Update fields
    if (title !== undefined) scenario.title = title;
    if (description !== undefined) scenario.description = description;
    if (type !== undefined) scenario.type = type;
    if (parameters !== undefined) scenario.parameters = parameters;

    // Save and return
    const updated = await scenario.save();
    res.status(200).json(updated);
  } catch (error: any) {
    console.error('Update scenario error:', error);
    res.status(500).json({ message: 'Failed to update scenario', error: error.message });
  }
};

/**
 * DELETE - DELETE /api/scenarios/:id
 * 
 * Deletes a scenario permanently
 * 
 * Response:
 * - 200: Confirmation message
 * - 403: Forbidden
 * - 404: Not found
 * - 500: Server error
 */
export const deleteScenario = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user;

    // Find scenario
    const scenario = await Scenario.findById(id);

    if (!scenario) {
      res.status(404).json({ message: 'Scenario not found' });
      return;
    }

    // Check ownership
    if (scenario.userId.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to delete this scenario' });
      return;
    }

    // Delete
    await Scenario.findByIdAndDelete(id);
    res.status(200).json({ message: 'Scenario deleted successfully' });
  } catch (error: any) {
    console.error('Delete scenario error:', error);
    res.status(500).json({ message: 'Failed to delete scenario', error: error.message });
  }
};

/**
 * TOGGLE - PATCH /api/scenarios/:id/toggle
 * 
 * Toggles scenario active/inactive status
 * 
 * Response:
 * - 200: Updated scenario with toggled isActive status
 * - 403: Forbidden
 * - 404: Not found
 * - 500: Server error
 * 
 * Example:
 * PATCH /api/scenarios/123/toggle
 * Response: { ...scenario, isActive: false }
 */
export const toggleScenarioActive = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user;

    // Find scenario
    const scenario = await Scenario.findById(id);

    if (!scenario) {
      res.status(404).json({ message: 'Scenario not found' });
      return;
    }

    // Check ownership
    if (scenario.userId.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to toggle this scenario' });
      return;
    }

    // Toggle isActive
    scenario.isActive = !scenario.isActive;

    // Save and return
    const updated = await scenario.save();
    res.status(200).json(updated);
  } catch (error: any) {
    console.error('Toggle scenario error:', error);
    res.status(500).json({ message: 'Failed to toggle scenario', error: error.message });
  }
};
