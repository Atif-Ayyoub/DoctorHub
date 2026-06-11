const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const UserModel = require('../models/User');
const PatientModel = require('../models/Patient');
const DoctorModel = require('../models/Doctor');
const { success, error } = require('../utils/responseHandler');
const { validate } = require('../middleware/validationMiddleware');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const supabase = require('../config/database');

const registerValidation = [
  body('full_name').trim().isLength({ min: 1, max: 100 }).withMessage('Full name must be 1-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters'),
  body('phone').matches(/^\+[1-9]\d{1,14}$/).withMessage('Phone must be in E.164 format (e.g. +12125551234)'),
  body('role').optional().isIn(['patient']).withMessage('Only patients can register publicly'),
  validate
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const register = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;
    const role = 'patient';
    const existing = await UserModel.findByEmail(email);
    if (existing) return error(res, 'Email already registered', 409);
    const password_hash = bcrypt.hashSync(password, 10);
    const user = await UserModel.create({ full_name, email, password_hash, phone, role });
    if (role === 'patient') await PatientModel.create({ user_id: user.id });
    if (role === 'doctor') await DoctorModel.create({ user_id: user.id });
    return success(res, { id: user.id, email: user.email, role: user.role }, 'Account created successfully', 201);
  } catch (e) {
    console.error(e);
    return error(res, 'Registration failed', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findByEmail(email);
    if (!user) return error(res, 'Invalid credentials', 401);
    if (user.status === 'inactive') return error(res, 'Account is deactivated', 401);
    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) return error(res, 'Invalid credentials', 401);
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    return success(res, { token, role: user.role, user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } }, 'Login successful');
  } catch (e) {
    return error(res, 'Login failed', 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findByEmail(email);
    if (user) {
      const token = uuidv4();
      const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await supabase.from('password_reset_tokens').insert({ id: uuidv4(), user_id: user.id, token, expires_at });
      console.log(`Password reset token for ${email}: ${token}`);
    }
    return success(res, {}, 'If that email exists, a reset link has been sent');
  } catch (e) {
    return error(res, 'Request failed', 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!password || password.length < 8) return error(res, 'Password must be at least 8 characters', 422);
    const { data: record } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();
    if (!record) return error(res, 'Reset token is invalid or expired', 400);
    const hash = bcrypt.hashSync(password, 10);
    await UserModel.updatePassword(record.user_id, hash);
    await supabase.from('password_reset_tokens').update({ used: true }).eq('id', record.id);
    return success(res, {}, 'Password reset successful');
  } catch (e) {
    return error(res, 'Reset failed', 500);
  }
};

const getProfile = async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  if (!user) return error(res, 'User not found', 404);
  const { password_hash, ...safe } = user;
  return success(res, safe);
};

module.exports = { register, registerValidation, login, loginValidation, forgotPassword, resetPassword, getProfile };
