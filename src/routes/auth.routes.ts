import { Router } from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  googleAuthRedirect,
  googleCallback,
  facebookAuthRedirect,
  facebookCallback,
} from '../controllers/auth.controller';
import { body, validationResult } from 'express-validator';



const router = Router();

// POST /auth/register
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  registerUser
);

// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginUser
);


router.post('/refresh-token', refreshAccessToken);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', getCurrentUser);

// OAuth routes
router.get('/google', googleAuthRedirect);
router.get('/google/callback', googleCallback);
router.get('/facebook', facebookAuthRedirect);
router.get('/facebook/callback', facebookCallback);

export default router;
