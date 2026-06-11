const supabase = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const AppointmentModel = {
  create: async ({ patient_id, doctor_id, clinic_id, scheduled_at, notes }) => {
    const id = uuidv4();
    const { data } = await supabase.from('appointments').insert({
      id, patient_id, doctor_id, clinic_id, scheduled_at, notes: notes || null
    }).select().single();
    return data;
  },
  findById: async (id) => {
    const { data } = await supabase.from('appointments').select('*').eq('id', id).single();
    return data;
  },
  updateStatus: async (id, status) => {
    await supabase.from('appointments').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  },
  isSlotTaken: async (doctor_id, scheduled_at) => {
    const { data } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctor_id)
      .eq('scheduled_at', scheduled_at)
      .neq('status', 'cancelled')
      .limit(1)
      .single();
    return data;
  },
  getForPatient: async (patient_id) => {
    const { data } = await supabase
      .from('appointments')
      .select(`*, doctors!appointments_doctor_id_fkey(user_id, users!doctors_user_id_fkey(full_name)), clinics!appointments_clinic_id_fkey(name)`)
      .eq('patient_id', patient_id)
      .order('scheduled_at', { ascending: false });
    return (data || []).map(a => ({
      ...a,
      doctor_name: a.doctors?.users?.full_name,
      doctor_user_id: a.doctors?.user_id,
      clinic_name: a.clinics?.name,
      doctors: undefined,
      clinics: undefined
    }));
  },
  getForDoctor: async (doctor_id) => {
    const { data } = await supabase
      .from('appointments')
      .select(`*, patients!appointments_patient_id_fkey(user_id, users!patients_user_id_fkey(full_name)), clinics!appointments_clinic_id_fkey(name)`)
      .eq('doctor_id', doctor_id)
      .order('scheduled_at', { ascending: false });
    return (data || []).map(a => ({
      ...a,
      patient_name: a.patients?.users?.full_name,
      patient_user_id: a.patients?.user_id,
      clinic_name: a.clinics?.name,
      patients: undefined,
      clinics: undefined
    }));
  },
  getPendingExpired: async () => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'pending_payment')
      .lt('created_at', cutoff);
    return data || [];
  },
  hasConfirmedAppointment: async (patient_id, doctor_id) => {
    const { data } = await supabase
      .from('appointments')
      .select('id')
      .eq('patient_id', patient_id)
      .eq('doctor_id', doctor_id)
      .in('status', ['confirmed', 'completed'])
      .limit(1)
      .single();
    return data;
  }
};

module.exports = AppointmentModel;
