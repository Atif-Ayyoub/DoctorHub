const AppointmentModel = require('../models/Appointment');
const DoctorModel = require('../models/Doctor');
const PatientModel = require('../models/Patient');
const ClinicModel = require('../models/Clinic');
const NotificationService = require('../services/notificationService');
const { success, error } = require('../utils/responseHandler');

const bookAppointment = async (req, res) => {
  try {
    const patient = await PatientModel.findByUserId(req.user.id);
    if (!patient) return error(res, 'Patient not found', 404);
    const { doctor_id, clinic_id, scheduled_at, notes } = req.body;
    if (!doctor_id || !clinic_id || !scheduled_at) return error(res, 'doctor_id, clinic_id, and scheduled_at are required', 422);
    const doctor = await DoctorModel.findById(doctor_id);
    if (!doctor) return error(res, 'Doctor not found', 404);
    const clinic = await ClinicModel.findById(clinic_id);
    if (!clinic) return error(res, 'Clinic not found', 404);
    const taken = await AppointmentModel.isSlotTaken(doctor_id, scheduled_at);
    if (taken) return error(res, 'Slot unavailable', 409);
    const appt = await AppointmentModel.create({ patient_id: patient.id, doctor_id, clinic_id, scheduled_at, notes });
    return success(res, appt, 'Appointment booked', 201);
  } catch (e) {
    console.error(e);
    return error(res, 'Failed to book appointment', 500);
  }
};

const getMyAppointments = async (req, res) => {
  const patient = await PatientModel.findByUserId(req.user.id);
  if (!patient) return error(res, 'Patient not found', 404);
  const appointments = await AppointmentModel.getForPatient(patient.id);
  return success(res, appointments);
};

const getDoctorAppointments = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const appointments = await AppointmentModel.getForDoctor(doc.id);
  return success(res, appointments);
};

const cancelAppointment = async (req, res) => {
  const patient = await PatientModel.findByUserId(req.user.id);
  if (!patient) return error(res, 'Patient not found', 404);
  const appt = await AppointmentModel.findById(req.params.id);
  if (!appt) return error(res, 'Appointment not found', 404);
  if (appt.patient_id !== patient.id) return error(res, 'Insufficient permissions', 403);
  if (!['pending_payment','confirmed'].includes(appt.status)) return error(res, 'Cannot cancel this appointment', 409);
  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  if (appt.scheduled_at <= twoHoursFromNow) return error(res, 'Cancellation window has passed', 409);
  await AppointmentModel.updateStatus(appt.id, 'cancelled');
  return success(res, {}, 'Appointment cancelled');
};

const completeAppointment = async (req, res) => {
  const doc = await DoctorModel.findByUserId(req.user.id);
  if (!doc) return error(res, 'Doctor not found', 404);
  const appt = await AppointmentModel.findById(req.params.id);
  if (!appt || appt.doctor_id !== doc.id) return error(res, 'Appointment not found', 404);
  if (appt.status !== 'confirmed') return error(res, 'Only confirmed appointments can be completed', 409);
  await AppointmentModel.updateStatus(appt.id, 'completed');
  return success(res, {}, 'Appointment completed');
};

const getAssistantAppointments = async (req, res) => {
  const AssistantModel = require('../models/Assistant');
  const assistant = await AssistantModel.findByUserId(req.user.id);
  if (!assistant) return error(res, 'Assistant not found', 404);
  const appointments = await AppointmentModel.getForDoctor(assistant.doctor_id);
  return success(res, appointments);
};

module.exports = { bookAppointment, getMyAppointments, getDoctorAppointments, cancelAppointment, completeAppointment, getAssistantAppointments };
