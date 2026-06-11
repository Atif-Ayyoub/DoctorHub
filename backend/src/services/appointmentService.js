const AppointmentModel = require('../models/Appointment');
const NotificationService = require('./notificationService');
const PatientModel = require('../models/Patient');

const AppointmentService = {
  cancelExpiredAppointments: async () => {
    const expired = await AppointmentModel.getPendingExpired();
    for (const appt of expired) {
      await AppointmentModel.updateStatus(appt.id, 'cancelled');
      const patient = await PatientModel.findById(appt.patient_id);
      if (patient) {
        await NotificationService.create(patient.user_id, 'Appointment Cancelled', 'Your appointment was automatically cancelled due to payment not received within 24 hours.');
      }
    }
    return expired.length;
  }
};

module.exports = AppointmentService;
