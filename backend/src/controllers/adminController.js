const UserModel = require('../models/User');
const DoctorModel = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const supabase = require('../config/database');
const { success, error } = require('../utils/responseHandler');

const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const page_size = Math.min(parseInt(req.query.page_size) || 20, 100);
  const result = await UserModel.getAll(page, page_size);
  return success(res, { ...result, page, page_size });
};

const createDoctor = async (req, res) => {
  try {
    const { full_name, email, password, phone, specialisation, treatment_type, bio, consultation_fee, experience_years } = req.body;
    if (!full_name || !email || !password || !phone) return error(res, 'full_name, email, password, and phone are required', 422);
    if (password.length < 8) return error(res, 'Password must be at least 8 characters', 422);
    const existing = await UserModel.findByEmail(email);
    if (existing) return error(res, 'Email already registered', 409);
    const hash = bcrypt.hashSync(password, 10);
    const user = await UserModel.create({ full_name, email, password_hash: hash, phone, role: 'doctor' });
    const doc = await DoctorModel.create({ user_id: user.id, specialisation, treatment_type, bio, consultation_fee, experience_years });
    return success(res, { user: { id: user.id, email: user.email }, doctor: doc }, 'Doctor account created', 201);
  } catch (e) {
    console.error(e);
    return error(res, 'Failed to create doctor', 500);
  }
};

const createAdmin = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;
    if (!full_name || !email || !password || !phone) return error(res, 'full_name, email, password, and phone are required', 422);
    if (password.length < 8) return error(res, 'Password must be at least 8 characters', 422);

    const existing = await UserModel.findByEmail(email);
    if (existing) return error(res, 'Email already registered', 409);

    const hash = bcrypt.hashSync(password, 10);
    const user = await UserModel.create({ full_name, email, password_hash: hash, phone, role: 'admin' });
    return success(res, { user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } }, 'Admin account created', 201);
  } catch (e) {
    console.error(e);
    return error(res, 'Failed to create admin', 500);
  }
};

const deactivateUser = async (req, res) => {
  const target = await UserModel.findById(req.params.id);
  if (!target) return error(res, 'User not found', 404);
  if (req.user.role === 'admin' && ['admin','super_admin'].includes(target.role)) return error(res, 'Insufficient permissions', 403);
  if (req.user.role === 'super_admin' && target.id === req.user.id) return error(res, 'Cannot deactivate your own account', 403);
  await UserModel.updateStatus(req.params.id, 'inactive');
  return success(res, {}, 'Account deactivated');
};

const activateUser = async (req, res) => {
  const target = await UserModel.findById(req.params.id);
  if (!target) return error(res, 'User not found', 404);
  await UserModel.updateStatus(req.params.id, 'active');
  return success(res, {}, 'Account activated');
};

const getReports = async (req, res) => {
  const [
    { data: usersByRole },
    { data: appointmentsByStatus },
    { data: paymentsByStatus },
    { count: totalDoctors },
    { count: totalPatients },
    { count: totalClinics }
  ] = await Promise.all([
    supabase.rpc('get_users_by_role').select(),
    supabase.rpc('get_appointments_by_status').select(),
    supabase.rpc('get_payments_by_status').select(),
    supabase.from('doctors').select('*', { count: 'exact', head: true }),
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('clinics').select('*', { count: 'exact', head: true }).eq('is_deleted', false)
  ]);
  return success(res, {
    total_doctors: totalDoctors || 0,
    total_patients: totalPatients || 0,
    total_clinics: totalClinics || 0,
    users_by_role: usersByRole || [],
    appointments_by_status: appointmentsByStatus || [],
    payments_by_status: paymentsByStatus || []
  });
};

module.exports = { getUsers, createDoctor, createAdmin, deactivateUser, activateUser, getReports };
