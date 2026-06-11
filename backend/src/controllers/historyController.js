const MedicalHistoryModel = require('../models/MedicalHistory');
const PatientModel = require('../models/Patient');
const AppointmentModel = require('../models/Appointment');
const DoctorModel = require('../models/Doctor');
const { success, error } = require('../utils/responseHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/reports');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Unsupported file type'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const getMyHistory = async (req, res) => {
  const patient = await PatientModel.findByUserId(req.user.id);
  if (!patient) return error(res, 'Patient not found', 404);
  const history = await MedicalHistoryModel.getForPatient(patient.id);
  return success(res, history);
};

const getPatientHistory = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const patient = await PatientModel.findById(req.params.patient_id);
  if (!patient) return error(res, 'Patient not found', 404);
  const confirmed = await AppointmentModel.hasConfirmedAppointment(patient.id, doc.id);
  if (!confirmed) return error(res, "Access to this patient's history is not authorised", 403);
  const history = await MedicalHistoryModel.getForPatient(patient.id);
  return success(res, history);
};

const addHistoryRecord = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const patient = await PatientModel.findById(req.params.patient_id);
  if (!patient) return error(res, 'Patient not found', 404);
  const confirmed = await AppointmentModel.hasConfirmedAppointment(patient.id, doc.id);
  if (!confirmed) return error(res, "Access to this patient's history is not authorised", 403);
  const { title, content } = req.body;
  if (!title) return error(res, 'title is required', 422);
  const record = await MedicalHistoryModel.create({ patient_id: patient.id, doctor_id: doc.id, record_type: 'note', title, content });
  return success(res, record, 'Record added', 201);
};

const uploadReport = async (req, res) => {
  const patient = await PatientModel.findByUserId(req.user.id);
  if (!patient) return error(res, 'Patient not found', 404);
  if (!req.file) return error(res, 'Report file is required', 422);
  const { title } = req.body;
  const record = await MedicalHistoryModel.create({
    patient_id: patient.id,
    doctor_id: null,
    record_type: 'report',
    title: title || req.file.originalname,
    file_path: req.file.path
  });
  return success(res, record, 'Report uploaded', 201);
};

module.exports = { upload, getMyHistory, getPatientHistory, addHistoryRecord, uploadReport };
