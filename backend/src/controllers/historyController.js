const MedicalHistoryModel = require('../models/MedicalHistory');
const PatientModel = require('../models/Patient');
const AppointmentModel = require('../models/Appointment');
const DoctorModel = require('../models/Doctor');
const { success, error } = require('../utils/responseHandler');
const { uploadFile } = require('../services/storageService');
const multer = require('multer');

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  const err = new Error('Unsupported file type');
  err.status = 422;
  return cb(err, false);
};
const upload = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

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
  try {
    const patient = await PatientModel.findByUserId(req.user.id);
    if (!patient) return error(res, 'Patient not found', 404);
    if (!req.file) return error(res, 'Report file is required', 422);
    const { title } = req.body;
    const uploaded = await uploadFile(req.file, 'reports');
    const record = await MedicalHistoryModel.create({
      patient_id: patient.id,
      doctor_id: null,
      record_type: 'report',
      title: title || req.file.originalname,
      file_path: uploaded.publicUrl
    });
    return success(res, record, 'Report uploaded', 201);
  } catch (e) {
    console.error(e);
    return error(res, e.status === 422 ? e.message : 'Report upload failed', e.status || 500);
  }
};

module.exports = { upload, getMyHistory, getPatientHistory, addHistoryRecord, uploadReport };
