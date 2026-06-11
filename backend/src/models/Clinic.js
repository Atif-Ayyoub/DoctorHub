const supabase = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const ClinicModel = {
  create: async ({ doctor_id, name, address, city, phone }) => {
    const id = uuidv4();
    const { data } = await supabase.from('clinics').insert({
      id, doctor_id, name, address, city, phone: phone || null
    }).select().single();
    return data;
  },
  findById: async (id) => {
    const { data } = await supabase.from('clinics').select('*').eq('id', id).eq('is_deleted', false).single();
    return data;
  },
  findByDoctor: async (doctor_id) => {
    const { data } = await supabase.from('clinics').select('*').eq('doctor_id', doctor_id).eq('is_deleted', false);
    return data || [];
  },
  countByDoctor: async (doctor_id) => {
    const { count } = await supabase.from('clinics').select('*', { count: 'exact', head: true }).eq('doctor_id', doctor_id).eq('is_deleted', false);
    return count || 0;
  },
  update: async (id, fields) => {
    const { data } = await supabase.from('clinics').update(fields).eq('id', id).select().single();
    return data;
  },
  softDelete: async (id) => {
    await supabase.from('clinics').update({ is_deleted: true }).eq('id', id);
  },
  hasFutureAppointments: async (clinic_id) => {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('appointments')
      .select('id')
      .eq('clinic_id', clinic_id)
      .eq('status', 'confirmed')
      .gt('scheduled_at', now)
      .limit(1)
      .single();
    return data;
  }
};

module.exports = ClinicModel;
