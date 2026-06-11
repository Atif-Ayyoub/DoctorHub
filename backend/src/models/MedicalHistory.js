const supabase = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const MedicalHistoryModel = {
  create: async ({ patient_id, doctor_id, record_type, title, content, file_path }) => {
    const id = uuidv4();
    const { data } = await supabase.from('medical_history').insert({
      id, patient_id,
      doctor_id: doctor_id || null,
      record_type, title,
      content: content || null,
      file_path: file_path || null
    }).select().single();
    return data;
  },
  getForPatient: async (patient_id) => {
    const { data } = await supabase
      .from('medical_history')
      .select(`*, doctors!medical_history_doctor_id_fkey(users!doctors_user_id_fkey(full_name))`)
      .eq('patient_id', patient_id)
      .order('created_at', { ascending: false });
    return (data || []).map(r => ({ ...r, doctor_name: r.doctors?.users?.full_name, doctors: undefined }));
  }
};

module.exports = MedicalHistoryModel;
