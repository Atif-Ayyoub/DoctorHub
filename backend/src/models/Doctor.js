const supabase = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const DoctorModel = {
  create: async ({ user_id, specialisation, treatment_type, bio, consultation_fee, experience_years }) => {
    const id = uuidv4();
    const { data } = await supabase.from('doctors').insert({
      id, user_id, specialisation, treatment_type, bio,
      consultation_fee: consultation_fee || 0,
      experience_years: experience_years || 0
    }).select().single();
    return data;
  },
  findByUserId: async (user_id) => {
    const { data } = await supabase.from('doctors').select('*').eq('user_id', user_id).single();
    return data;
  },
  findById: async (id) => {
    const { data } = await supabase.from('doctors').select('*').eq('id', id).single();
    return data;
  },
  update: async (id, fields) => {
    const { data } = await supabase.from('doctors').update(fields).eq('id', id).select().single();
    return data;
  },
  search: async ({ treatment_type, disease, page = 1, page_size = 20 }) => {
    const from = (page - 1) * page_size;
    const to = from + page_size - 1;

    let query = supabase
      .from('doctors')
      .select(`*, users!doctors_user_id_fkey(full_name, email, phone, status)`, { count: 'exact' })
      .eq('users.status', 'active');

    if (treatment_type) query = query.eq('treatment_type', treatment_type);
    if (disease) query = query.or(`specialisation.ilike.%${disease}%,bio.ilike.%${disease}%`);

    const { data, count } = await query.order('id').range(from, to);

    // Flatten user data
    const doctors = (data || []).map(d => {
      const u = d.users || {};
      const { users: _, ...rest } = d;
      return { ...rest, full_name: u.full_name, email: u.email, phone: u.phone, status: u.status };
    });

    return { doctors, total: count || 0 };
  },
  getFullProfile: async (id) => {
    const { data: doc } = await supabase
      .from('doctors')
      .select(`*, users!doctors_user_id_fkey(full_name, email, phone, status)`)
      .eq('id', id)
      .single();

    if (!doc) return null;

    const { data: clinics } = await supabase.from('clinics').select('*').eq('doctor_id', id).eq('is_deleted', false);
    const { data: schedules } = await supabase.from('schedules').select('*').eq('doctor_id', id).eq('is_active', true);

    const u = doc.users || {};
    const { users: _, ...rest } = doc;
    return { ...rest, full_name: u.full_name, email: u.email, phone: u.phone, status: u.status, clinics: clinics || [], schedules: schedules || [] };
  }
};

module.exports = DoctorModel;
