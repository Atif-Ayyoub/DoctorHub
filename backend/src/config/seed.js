const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const supabase = require('./database');

async function seed() {
  console.log('Seeding Supabase database...');

  // Create super admin
  const { data: existingSA } = await supabase.from('users').select('id').eq('role', 'super_admin').single();
  if (!existingSA) {
    const saId = uuidv4();
    const hash = bcrypt.hashSync('SuperAdmin@123', 10);
    await supabase.from('users').insert({ id: saId, full_name: 'Super Admin', email: 'superadmin@doctorhub.com', password_hash: hash, phone: '+10000000000', role: 'super_admin', status: 'active' });
    console.log('Super Admin created: superadmin@doctorhub.com / SuperAdmin@123');
  }

  // Create admin
  const { data: existingAdmin } = await supabase.from('users').select('id').eq('email', 'admin@doctorhub.com').single();
  if (!existingAdmin) {
    const adminId = uuidv4();
    const hash = bcrypt.hashSync('Admin@12345', 10);
    await supabase.from('users').insert({ id: adminId, full_name: 'Platform Admin', email: 'admin@doctorhub.com', password_hash: hash, phone: '+10000000001', role: 'admin', status: 'active' });
    console.log('Admin created: admin@doctorhub.com / Admin@12345');
  }

  // Create a sample doctor
  const { data: existingDoc } = await supabase.from('users').select('id').eq('email', 'doctor@doctorhub.com').single();
  if (!existingDoc) {
    const docUserId = uuidv4();
    const docId = uuidv4();
    const hash = bcrypt.hashSync('Doctor@123', 10);
    await supabase.from('users').insert({ id: docUserId, full_name: 'Dr. Ahmed Khan', email: 'doctor@doctorhub.com', password_hash: hash, phone: '+92300000000', role: 'doctor', status: 'active' });
    await supabase.from('doctors').insert({ id: docId, user_id: docUserId, specialisation: 'General Physician, Fever, Flu, Diabetes', treatment_type: 'Allopathic', bio: 'Experienced general physician with 10 years of practice.', consultation_fee: 500, experience_years: 10 });
    const clinicId = uuidv4();
    await supabase.from('clinics').insert({ id: clinicId, doctor_id: docId, name: 'Khan Clinic', address: '123 Main Street', city: 'Karachi' });
    const scheduleId = uuidv4();
    await supabase.from('schedules').insert({ id: scheduleId, clinic_id: clinicId, doctor_id: docId, day_of_week: 'Monday', start_time: '09:00', end_time: '17:00', slot_duration: 30 });
    console.log('Sample Doctor created: doctor@doctorhub.com / Doctor@123');
  }

  // Create a sample patient
  const { data: existingPatient } = await supabase.from('users').select('id').eq('email', 'patient@doctorhub.com').single();
  if (!existingPatient) {
    const patUserId = uuidv4();
    const patId = uuidv4();
    const hash = bcrypt.hashSync('Patient@123', 10);
    await supabase.from('users').insert({ id: patUserId, full_name: 'Ali Hassan', email: 'patient@doctorhub.com', password_hash: hash, phone: '+92311000000', role: 'patient', status: 'active' });
    await supabase.from('patients').insert({ id: patId, user_id: patUserId, date_of_birth: '1990-05-15', gender: 'male', blood_group: 'O+' });
    console.log('Sample Patient created: patient@doctorhub.com / Patient@123');
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
