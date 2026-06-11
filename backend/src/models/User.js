const supabase = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const UserModel = {
  findByEmail: async (email) => {
    const { data } = await supabase.from('users').select('*').eq('email', email).single();
    return data;
  },
  findById: async (id) => {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data;
  },
  create: async ({ full_name, email, password_hash, phone, role }) => {
    const id = uuidv4();
    const { data } = await supabase.from('users').insert({ id, full_name, email, password_hash, phone, role }).select().single();
    return data;
  },
  updateStatus: async (id, status) => {
    await supabase.from('users').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  },
  updatePassword: async (id, password_hash) => {
    await supabase.from('users').update({ password_hash, updated_at: new Date().toISOString() }).eq('id', id);
  },
  getAll: async (page = 1, pageSize = 20) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data: users, count } = await supabase
      .from('users')
      .select('id, full_name, email, phone, role, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    return { users: users || [], total: count || 0 };
  }
};

module.exports = UserModel;
