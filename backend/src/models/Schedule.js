const supabase = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const ScheduleModel = {
  create: async ({ clinic_id, doctor_id, day_of_week, start_time, end_time, slot_duration }) => {
    const id = uuidv4();
    const { data } = await supabase.from('schedules').insert({
      id, clinic_id, doctor_id, day_of_week, start_time, end_time, slot_duration
    }).select().single();
    return data;
  },
  findByClinic: async (clinic_id) => {
    const { data } = await supabase.from('schedules').select('*').eq('clinic_id', clinic_id).eq('is_active', true);
    return data || [];
  },
  findByDoctor: async (doctor_id) => {
    const { data } = await supabase.from('schedules').select('*').eq('doctor_id', doctor_id);
    return data || [];
  },
  findById: async (id) => {
    const { data } = await supabase.from('schedules').select('*').eq('id', id).single();
    return data;
  },
  update: async (id, fields) => {
    const { data } = await supabase.from('schedules').update(fields).eq('id', id).select().single();
    return data;
  },
  deactivate: async (id) => {
    await supabase.from('schedules').update({ is_active: false }).eq('id', id);
  }
};

module.exports = ScheduleModel;
