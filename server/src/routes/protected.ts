import { Router, Response, NextFunction } from 'express';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
