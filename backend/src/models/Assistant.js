const supabase = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const AssistantModel = {
  findByUserId: async (user_id) => {
    const { data } = await supabase.from('assistants').select('*').eq('user_id', user_id).single();
    return data;
  },
  findByDoctor: async (doctor_id) => {
    const { data } = await supabase
      .from('assistants')
      .select(`*, users!assistants_user_id_fkey(full_name, email, phone)`)
      .eq('doctor_id', doctor_id);
    return (data || []).map(a => ({
      ...a,
      full_name: a.users?.full_name,
      email: a.users?.email,
      phone: a.users?.phone,
      users: undefined
    }));
  },
  countByDoctor: async (doctor_id) => {
    const { count } = await supabase.from('assistants').select('*', { count: 'exact', head: true }).eq('doctor_id', doctor_id);
    return count || 0;
  },
  findById: async (id) => {
    const { data } = await supabase.from('assistants').select('*').eq('id', id).single();
    return data;
  },
  create: async ({ user_id, doctor_id }) => {
    const id = uuidv4();
    const { data } = await supabase.from('assistants').insert({ id, user_id, doctor_id }).select().single();
    return data;
  },
  delete: async (id) => {
    await supabase.from('assistants').delete().eq('id', id);
  }
};

module.exports = AssistantModel;
