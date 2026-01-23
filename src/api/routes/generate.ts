import { Router, Request, Response } from 'express';
import { validateRequest } from '../../middleware/validation';
import { authenticateToken } from '../../middleware/auth';
import { aiService } from '../../services/aiService';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * AI Generation API Endpoint
 * Handles requests to generate AI-powered content for fitness and nutrition
 */

interface GenerateRequest extends Request {
  body: {
    type: 'meal' | 'workout' | 'nutrition_plan' | 'recipe';
    prompt: string;
    preferences?: {
      dietaryRestrictions?: string[];
      fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
      goal?: string;
      duration?: number;
    };
  };
}

/**
 * POST /api/generate
 * Generate AI content based on user prompt and preferences
 */
router.post('/', authenticateToken, validateRequest, async (req: GenerateRequest, res: Response) => {
  try {
    const { type, prompt, preferences } = req.body;
    const userId = (req as any).userId;

    // Validate required fields
    if (!type || !prompt) {
      return res.status(400).json({
        error: 'Missing required fields: type and prompt',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`Generating ${type} content for user ${userId}`, { type, promptLength: prompt.length });

    // Call AI service to generate content
    const generatedContent = await aiService.generate({
      type,
      prompt,
      preferences,
      userId,
    });

    // Return successful response
    return res.status(200).json({
      success: true,
      data: generatedContent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error generating AI content', { error: error instanceof Error ? error.message : String(error) });

    return res.status(500).json({
      error: 'Failed to generate content',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/generate/history
 * Retrieve user's previous generation history
 */
router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    logger.info(`Fetching generation history for user ${userId}`, { limit, offset });

    const history = await aiService.getGenerationHistory({
      userId,
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: history.items,
      pagination: {
        total: history.total,
        limit,
        offset,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching generation history', { error: error instanceof Error ? error.message : String(error) });

    return res.status(500).json({
      error: 'Failed to fetch generation history',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * DELETE /api/generate/:id
 * Delete a specific generated item
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).userId;

    logger.info(`Deleting generated item ${id} for user ${userId}`);

    await aiService.deleteGeneratedItem({
      id,
      userId,
    });

    return res.status(200).json({
      success: true,
      message: 'Generated item deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error deleting generated item', { error: error instanceof Error ? error.message : String(error) });

    return res.status(500).json({
      error: 'Failed to delete generated item',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
