const supabase = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const PrescriptionModel = {
  create: async ({ appointment_id, doctor_id, patient_id, medications, dosage_instructions, diagnosis_notes }) => {
    const id = uuidv4();
    const meds = typeof medications === 'string' ? medications : JSON.stringify(medications);
    const { data } = await supabase.from('prescriptions').insert({
      id, appointment_id, doctor_id, patient_id, medications: meds, dosage_instructions, diagnosis_notes
    }).select().single();
    return data;
  },
  findByAppointmentId: async (appointment_id) => {
    const { data } = await supabase.from('prescriptions').select('*').eq('appointment_id', appointment_id).single();
    return data;
  },
  getForPatient: async (patient_id) => {
    const { data } = await supabase
      .from('prescriptions')
      .select(`*, doctors!prescriptions_doctor_id_fkey(users!doctors_user_id_fkey(full_name))`)
      .eq('patient_id', patient_id)
      .order('created_at', { ascending: false });
    return (data || []).map(p => ({ ...p, doctor_name: p.doctors?.users?.full_name, doctors: undefined }));
  },
  getForDoctorPatient: async (doctor_id, patient_id) => {
    const { data } = await supabase
      .from('prescriptions')
      .select(`*, patients!prescriptions_patient_id_fkey(users!patients_user_id_fkey(full_name))`)
      .eq('doctor_id', doctor_id)
      .eq('patient_id', patient_id)
      .order('created_at', { ascending: false });
    return (data || []).map(p => ({ ...p, patient_name: p.patients?.users?.full_name, patients: undefined }));
  }
};

module.exports = PrescriptionModel;
