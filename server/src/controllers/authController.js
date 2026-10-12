const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'studyvault_secret_dev_key_12345', {
    expiresIn: '7d',
  });
};

// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'student',
      semester: semester ? Number(semester) : 1,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        googleConnected: Boolean(user.googleAccessToken || user.googleId),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        googleConnected: Boolean(user.googleAccessToken || user.googleId),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        googleConnected: Boolean(user.googleAccessToken || user.googleId),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, semester } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (semester) user.semester = Number(semester);
    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        googleConnected: Boolean(user.googleAccessToken || user.googleId),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/auth/google
// Connect or login with Google token / payload
exports.googleAuth = async (req, res, next) => {
  try {
    const { googleId, email, name, accessToken, refreshToken } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google authentication requires email' });
    }

    let user = await User.findOne({ email });

    if (user) {
      // Update tokens & googleId
      if (googleId) user.googleId = googleId;
      if (accessToken) user.googleAccessToken = accessToken;
      if (refreshToken) user.googleRefreshToken = refreshToken;
      await user.save();
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        googleAccessToken: accessToken || null,
        googleRefreshToken: refreshToken || null,
        role: 'student',
        semester: 3,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        googleConnected: Boolean(user.googleAccessToken || user.googleId),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/auth/demo-switch
// Adjustment #3: Enable demo switch only when NODE_ENV !== "production"
exports.demoSwitch = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Demo role switching is disabled in production environment.',
      });
    }

    const { role } = req.body; // 'student' or 'admin'
    const targetRole = role === 'admin' ? 'admin' : 'student';

    // Find demo user or create if not yet existing
    let user = await User.findOne({ role: targetRole });
    if (!user) {
      user = await User.create({
        name: targetRole === 'admin' ? 'Dr. Alan Vance (Faculty Admin)' : 'Aarav Sharma (Student)',
        email: targetRole === 'admin' ? 'admin@studyvault.edu' : 'student@studyvault.edu',
        password: 'password123',
        role: targetRole,
        semester: targetRole === 'student' ? 3 : 1,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        googleConnected: Boolean(user.googleAccessToken || user.googleId),
      },
      message: `Switched to ${targetRole} mode (Development only)`,
    });
  } catch (err) {
    next(err);
  }
};
