require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./utils/errorHandler');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const routes = [
  ['auth', require('./routes/authRoutes')],
  ['doctors', require('./routes/doctorRoutes')],
  ['appointments', require('./routes/appointmentRoutes')],
  ['payments', require('./routes/paymentRoutes')],
  ['history', require('./routes/historyRoutes')],
  ['prescriptions', require('./routes/prescriptionRoutes')],
  ['messages', require('./routes/messageRoutes')],
  ['notifications', require('./routes/notificationRoutes')],
  ['admin', require('./routes/adminRoutes')],
];

routes.forEach(([name, router]) => {
  app.use(`/api/${name}`, router);
  app.use(`/${name}`, router);
});

const healthHandler = (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() });
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

app.use(errorHandler);

// Auto-cancel expired appointments every 5 minutes
const AppointmentService = require('./services/appointmentService');
setInterval(async () => {
  try { await AppointmentService.cancelExpiredAppointments(); } catch(e) { console.error('Cleanup error:', e.message); }
}, 5 * 60 * 1000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Doctor Hub API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Supabase URL: ${process.env.SUPABASE_URL || 'https://mbetzlrmubmzjpllvowe.supabase.co'}`);
});

module.exports = app;
