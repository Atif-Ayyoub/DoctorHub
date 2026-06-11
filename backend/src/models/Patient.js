const supabase = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const PatientModel = {
  create: async ({ user_id, date_of_birth, gender, blood_group }) => {
    const id = uuidv4();
    const { data } = await supabase.from('patients').insert({
      id, user_id,
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      blood_group: blood_group || null
    }).select().single();
    return data;
  },
  findByUserId: async (user_id) => {
    const { data } = await supabase.from('patients').select('*').eq('user_id', user_id).single();
    return data;
  },
  findById: async (id) => {
    const { data } = await supabase.from('patients').select('*').eq('id', id).single();
    return data;
  }
};

module.exports = PatientModel;
