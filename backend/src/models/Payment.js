const supabase = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const PaymentModel = {
  create: async ({ appointment_id, patient_id, file_path, file_type }) => {
    const id = uuidv4();
    const { data } = await supabase.from('payments').insert({ id, appointment_id, patient_id, file_path, file_type }).select().single();
    return data;
  },
  findByAppointmentId: async (appointment_id) => {
    const { data } = await supabase.from('payments').select('*').eq('appointment_id', appointment_id).single();
    return data;
  },
  findById: async (id) => {
    const { data } = await supabase.from('payments').select('*').eq('id', id).single();
    return data;
  },
  updateStatus: async (id, status, extra = {}) => {
    const updates = { status, updated_at: new Date().toISOString() };
    if (status === 'verified') updates.verified_by = extra.verified_by || null;
    if (status === 'rejected') updates.rejection_reason = extra.rejection_reason || null;
    const { data } = await supabase.from('payments').update(updates).eq('id', id).select().single();
    return data;
  },
  getPendingForDoctor: async (doctor_id) => {
    const { data } = await supabase
      .from('payments')
      .select(`*, appointments!payments_appointment_id_fkey(scheduled_at, doctor_id), patients!payments_patient_id_fkey(users!patients_user_id_fkey(full_name))`)
      .eq('status', 'pending_verification')
      .eq('appointments.doctor_id', doctor_id)
      .order('created_at', { ascending: false });
    return (data || []).map(p => ({
      ...p,
      scheduled_at: p.appointments?.scheduled_at,
      doctor_id: p.appointments?.doctor_id,
      patient_name: p.patients?.users?.full_name,
      appointments: undefined,
      patients: undefined
    }));
  },
  getAll: async (doctor_id) => {
    const { data } = await supabase
      .from('payments')
      .select(`*, appointments!payments_appointment_id_fkey(scheduled_at, doctor_id), patients!payments_patient_id_fkey(users!patients_user_id_fkey(full_name))`)
      .eq('appointments.doctor_id', doctor_id)
      .order('created_at', { ascending: false });
    return (data || []).map(p => ({
      ...p,
      scheduled_at: p.appointments?.scheduled_at,
      doctor_id: p.appointments?.doctor_id,
      patient_name: p.patients?.users?.full_name,
      appointments: undefined,
      patients: undefined
    }));
  }
};

module.exports = PaymentModel;
