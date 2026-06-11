const PrescriptionModel = require('../models/Prescription');
const AppointmentModel = require('../models/Appointment');
const DoctorModel = require('../models/Doctor');
const PatientModel = require('../models/Patient');
const MedicalHistoryModel = require('../models/MedicalHistory');
const { success, error } = require('../utils/responseHandler');

const createPrescription = async (req, res) => {
  try {
    const doc = await DoctorModel.findByUserId(req.user.id);
    if (!doc) return error(res, 'Doctor not found', 404);
    const { appointment_id, medications, dosage_instructions, diagnosis_notes } = req.body;
    if (!appointment_id || !medications || !dosage_instructions || !diagnosis_notes)
      return error(res, 'appointment_id, medications, dosage_instructions, and diagnosis_notes are required', 422);
    const appt = await AppointmentModel.findById(appointment_id);
    if (!appt) return error(res, 'Appointment not found', 404);
    if (appt.doctor_id !== doc.id) return error(res, 'Insufficient permissions', 403);
    if (appt.status !== 'confirmed') return error(res, 'Prescription can only be created for confirmed appointments', 409);
    const existing = await PrescriptionModel.findByAppointmentId(appointment_id);
    if (existing) return error(res, 'Prescription already exists for this appointment', 409);
    const prescription = await PrescriptionModel.create({ appointment_id, doctor_id: doc.id, patient_id: appt.patient_id, medications, dosage_instructions, diagnosis_notes });
    await MedicalHistoryModel.create({
      patient_id: appt.patient_id,
      doctor_id: doc.id,
      record_type: 'prescription',
      title: `Prescription - ${diagnosis_notes.slice(0, 50)}`,
      content: `Medications: ${typeof medications === 'string' ? medications : JSON.stringify(medications)}`
    });
    return success(res, prescription, 'Prescription created', 201);
  } catch (e) {
    console.error(e);
    return error(res, 'Failed to create prescription', 500);
  }
};

const getMyPrescriptions = async (req, res) => {
  const patient = await PatientModel.findByUserId(req.user.id);
  if (!patient) return error(res, 'Patient not found', 404);
  const prescriptions = await PrescriptionModel.getForPatient(patient.id);
  return success(res, prescriptions);
};

const getPatientPrescriptions = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const patient = await PatientModel.findById(req.params.patient_id);
  if (!patient) return error(res, 'Patient not found', 404);
  const prescriptions = await PrescriptionModel.getForDoctorPatient(doc.id, patient.id);
  return success(res, prescriptions);
};

module.exports = { createPrescription, getMyPrescriptions, getPatientPrescriptions };
