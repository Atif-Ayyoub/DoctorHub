const DoctorModel = require('../models/Doctor');
const UserModel = require('../models/User');
const ClinicModel = require('../models/Clinic');
const ScheduleModel = require('../models/Schedule');
const AssistantModel = require('../models/Assistant');
const bcrypt = require('bcryptjs');
const { success, error } = require('../utils/responseHandler');

const getProfile = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const profile = await DoctorModel.getFullProfile(doc.id);
  return success(res, profile);
};

const updateProfile = async (req, res) => {
  const { specialisation, treatment_type, bio, consultation_fee, experience_years } = req.body;
  if (treatment_type && !['Allopathic','Homeopathic','Herbal'].includes(treatment_type))
    return error(res, 'treatment_type must be one of Allopathic, Homeopathic, Herbal', 422);
  if (consultation_fee !== undefined && (isNaN(consultation_fee) || Number(consultation_fee) < 0))
    return error(res, 'consultation_fee must be a positive number', 422);
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const fields = {};
  if (specialisation !== undefined) fields.specialisation = specialisation;
  if (treatment_type !== undefined) fields.treatment_type = treatment_type;
  if (bio !== undefined) fields.bio = bio;
  if (consultation_fee !== undefined) fields.consultation_fee = Number(consultation_fee);
  if (experience_years !== undefined) fields.experience_years = Number(experience_years);
  const updated = await DoctorModel.update(doc.id, fields);
  return success(res, updated);
};

const searchDoctors = async (req, res) => {
  const { treatment_type, disease, page, page_size } = req.query;
  const p = parseInt(page) || 1;
  const ps = Math.min(parseInt(page_size) || 20, 100);
  const result = await DoctorModel.search({ treatment_type, disease, page: p, page_size: ps });
  return success(res, { doctors: result.doctors, total: result.total, page: p, page_size: ps });
};

const getDoctorById = async (req, res) => {
  const doc = await DoctorModel.getFullProfile(req.params.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  return success(res, doc);
};

const createClinic = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const count = await ClinicModel.countByDoctor(doc.id);
  if (count >= 5) return error(res, 'Maximum of 5 clinics allowed per doctor', 422);
  const { name, address, city, phone } = req.body;
  if (!name || !address || !city) return error(res, 'name, address, and city are required', 422);
  const clinic = await ClinicModel.create({ doctor_id: doc.id, name, address, city, phone });
  return success(res, clinic, 'Clinic created', 201);
};

const updateClinic = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const clinic = await ClinicModel.findById(req.params.id);
  if (!clinic) return error(res, 'Clinic not found', 404);
  if (clinic.doctor_id !== doc.id) return error(res, 'Insufficient permissions', 403);
  const { name, address, city, phone } = req.body;
  const fields = {};
  if (name) fields.name = name;
  if (address) fields.address = address;
  if (city) fields.city = city;
  if (phone !== undefined) fields.phone = phone;
  const updated = await ClinicModel.update(req.params.id, fields);
  return success(res, updated);
};

const deleteClinic = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const clinic = await ClinicModel.findById(req.params.id);
  if (!clinic) return error(res, 'Clinic not found', 404);
  if (clinic.doctor_id !== doc.id) return error(res, 'Insufficient permissions', 403);
  const future = await ClinicModel.hasFutureAppointments(req.params.id);
  if (future) return error(res, 'Cannot delete clinic with upcoming appointments', 409);
  await ClinicModel.softDelete(req.params.id);
  return success(res, {}, 'Clinic deleted');
};

const getClinics = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const clinics = await ClinicModel.findByDoctor(doc.id);
  return success(res, clinics);
};

const createSchedule = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const { clinic_id, day_of_week, start_time, end_time, slot_duration } = req.body;
  const validDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  if (!validDays.includes(day_of_week)) return error(res, 'day_of_week must be Monday-Sunday', 422);
  if (start_time >= end_time) return error(res, 'start_time must be before end_time', 422);
  if (slot_duration < 10 || slot_duration > 120) return error(res, 'slot_duration must be between 10 and 120 minutes', 422);
  const clinic = await ClinicModel.findById(clinic_id);
  if (!clinic || clinic.doctor_id !== doc.id) return error(res, 'Clinic not found or not yours', 404);
  const schedule = await ScheduleModel.create({ clinic_id, doctor_id: doc.id, day_of_week, start_time, end_time, slot_duration });
  return success(res, schedule, 'Schedule created', 201);
};

const getSchedules = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const schedules = await ScheduleModel.findByDoctor(doc.id);
  return success(res, schedules);
};

const updateSchedule = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const schedule = await ScheduleModel.findById(req.params.id);
  if (!schedule || schedule.doctor_id !== doc.id) return error(res, 'Schedule not found', 404);
  const { clinic_id, day_of_week, start_time, end_time, slot_duration, is_active } = req.body;
  const validDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  if (day_of_week && !validDays.includes(day_of_week)) return error(res, 'day_of_week must be Monday-Sunday', 422);
  if (clinic_id) {
    const clinic = await ClinicModel.findById(clinic_id);
    if (!clinic || clinic.doctor_id !== doc.id) return error(res, 'Clinic not found or not yours', 404);
  }
  const nextStart = start_time || schedule.start_time;
  const nextEnd = end_time || schedule.end_time;
  if (nextStart >= nextEnd) return error(res, 'start_time must be before end_time', 422);
  if (slot_duration && (slot_duration < 10 || slot_duration > 120)) return error(res, 'slot_duration must be between 10 and 120 minutes', 422);
  const fields = {};
  if (clinic_id) fields.clinic_id = clinic_id;
  if (day_of_week) fields.day_of_week = day_of_week;
  if (start_time) fields.start_time = start_time;
  if (end_time) fields.end_time = end_time;
  if (slot_duration) fields.slot_duration = slot_duration;
  if (is_active !== undefined) fields.is_active = is_active;
  const updated = await ScheduleModel.update(req.params.id, fields);
  return success(res, updated);
};

const addAssistant = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const count = await AssistantModel.countByDoctor(doc.id);
  if (count >= 3) return error(res, 'Maximum of 3 assistants allowed per doctor', 409);
  const { user_id, assistant_email, full_name, email, phone, password } = req.body;
  const normalizedEmail = assistant_email?.trim().toLowerCase();
  let user = user_id ? await UserModel.findById(user_id) : null;
  if (!user && normalizedEmail) user = await UserModel.findByEmail(normalizedEmail);
  if (!user) {
    if (!full_name || !email || !phone || !password) return error(res, 'full_name, email, phone, and password are required', 422);
    if (password.length < 8) return error(res, 'Password must be at least 8 characters', 422);
    const createEmail = email.trim().toLowerCase();
    const existingUser = await UserModel.findByEmail(createEmail);
    if (existingUser) return error(res, 'Email already registered', 409);
    const password_hash = bcrypt.hashSync(password, 10);
    user = await UserModel.create({ full_name, email: createEmail, password_hash, phone, role: 'assistant' });
  }
  if (user.role !== 'assistant') return error(res, 'User must be registered as an assistant', 422);
  const existing = await AssistantModel.findByUserId(user.id);
  if (existing) return error(res, 'User is already assigned as an assistant', 409);
  const assistant = await AssistantModel.create({ user_id: user.id, doctor_id: doc.id });
  return success(res, assistant, 'Assistant added', 201);
};

const getAssistants = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const assistants = await AssistantModel.findByDoctor(doc.id);
  return success(res, assistants);
};

const removeAssistant = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const assistant = await AssistantModel.findById(req.params.id);
  if (!assistant) return error(res, 'Assistant not found', 404);
  if (assistant.doctor_id !== doc.id) return error(res, 'Insufficient permissions', 403);
  await AssistantModel.delete(req.params.id);
  return success(res, {}, 'Assistant removed');
};

module.exports = { getProfile, updateProfile, searchDoctors, getDoctorById, createClinic, updateClinic, deleteClinic, getClinics, createSchedule, getSchedules, updateSchedule, addAssistant, getAssistants, removeAssistant };
