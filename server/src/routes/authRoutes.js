const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  googleAuth,
  demoSwitch,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Rate limited public auth routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.post('/demo-switch', authLimiter, demoSwitch);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
