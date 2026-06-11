const path = require('path');
const fs = require('fs');
const multer = require('multer');
const PaymentModel = require('../models/Payment');
const AppointmentModel = require('../models/Appointment');
const PatientModel = require('../models/Patient');
const NotificationService = require('../services/notificationService');
const AssistantModel = require('../models/Assistant');
const DoctorModel = require('../models/Doctor');
const UserModel = require('../models/User');
const { success, error } = require('../utils/responseHandler');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/payments');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported file type'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const getActorDoctorId = async (user) => {
  if (user.role === 'doctor') {
    const doc = await DoctorModel.findByUserId(user.id);
    return doc?.id;
  }

  const assistant = await AssistantModel.findByUserId(user.id);
  return assistant?.doctor_id;
};

const uploadPayment = async (req, res) => {
  try {
    const patient = await PatientModel.findByUserId(req.user.id);
    if (!patient) return error(res, 'Patient not found', 404);
    if (!req.file) return error(res, 'Payment screenshot is required', 422);
    const { appointment_id } = req.body;
    if (!appointment_id) return error(res, 'appointment_id is required', 422);
    const appt = await AppointmentModel.findById(appointment_id);
    if (!appt) return error(res, 'Appointment not found', 404);
    if (appt.patient_id !== patient.id) return error(res, 'Insufficient permissions', 403);
    const existing = await PaymentModel.findByAppointmentId(appointment_id);
    if (existing) return error(res, 'Payment already uploaded for this appointment', 409);
    const payment = await PaymentModel.create({
      appointment_id,
      patient_id: patient.id,
      file_path: `/uploads/payments/${req.file.filename}`,
      file_type: req.file.mimetype
    });
    return success(res, payment, 'Payment uploaded', 201);
  } catch (e) {
    console.error(e);
    return error(res, 'Upload failed', 500);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const doctorId = await getActorDoctorId(req.user);
    if (!doctorId) return error(res, 'Doctor or assistant profile not found', 404);
    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) return error(res, 'Payment not found', 404);
    const appt = await AppointmentModel.findById(payment.appointment_id);
    if (appt.doctor_id !== doctorId) return error(res, 'Insufficient permissions', 403);
    await PaymentModel.updateStatus(payment.id, 'verified', { verified_by: req.user.id });
    await AppointmentModel.updateStatus(appt.id, 'confirmed');
    const PatientModel2 = require('../models/Patient');
    const pat = await PatientModel2.findById(appt.patient_id);
    if (pat) await NotificationService.create(pat.user_id, 'Appointment Confirmed', 'Your payment has been verified and appointment is confirmed.');
    return success(res, {}, 'Payment verified');
  } catch (e) {
    console.error(e);
    return error(res, 'Verification failed', 500);
  }
};

const rejectPayment = async (req, res) => {
  try {
    const doctorId = await getActorDoctorId(req.user);
    if (!doctorId) return error(res, 'Doctor or assistant profile not found', 404);
    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) return error(res, 'Payment not found', 404);
    const appt = await AppointmentModel.findById(payment.appointment_id);
    if (appt.doctor_id !== doctorId) return error(res, 'Insufficient permissions', 403);
    const { rejection_reason } = req.body;
    if (!rejection_reason) return error(res, 'rejection_reason is required', 422);
    await PaymentModel.updateStatus(payment.id, 'rejected', { rejection_reason });
    const PatientModel2 = require('../models/Patient');
    const pat = await PatientModel2.findById(appt.patient_id);
    if (pat) await NotificationService.create(pat.user_id, 'Payment Rejected', `Your payment was rejected: ${rejection_reason}`);
    return success(res, {}, 'Payment rejected');
  } catch (e) {
    console.error(e);
    return error(res, 'Rejection failed', 500);
  }
};

const getPendingPayments = async (req, res) => {
  const assistant = await AssistantModel.findByUserId(req.user.id);
  if (!assistant) return error(res, 'Assistant not found', 404);
  const payments = await PaymentModel.getPendingForDoctor(assistant.doctor_id);
  return success(res, payments);
};

const getAllPayments = async (req, res) => {
  const assistant = await AssistantModel.findByUserId(req.user.id);
  if (!assistant) {
    const doc = await DoctorModel.findByUserId(req.user.id);
    if (!doc) return error(res, 'Not found', 404);
    return success(res, await PaymentModel.getAll(doc.id));
  }
  return success(res, await PaymentModel.getAll(assistant.doctor_id));
};

module.exports = { upload, uploadPayment, verifyPayment, rejectPayment, getPendingPayments, getAllPayments };
