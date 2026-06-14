import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { SEO } from './components/common/SEO';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import { getSeoForPath } from './utils/seo';

const Home = lazy(() => import('./pages/public/Home'));
const Doctors = lazy(() => import('./pages/public/Doctors'));
const DoctorProfile = lazy(() => import('./pages/public/DoctorProfile'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Notifications = lazy(() => import('./pages/notifications/Notifications'));
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const Appointments = lazy(() => import('./pages/patient/Appointments'));
const BookAppointment = lazy(() => import('./pages/patient/BookAppointment'));
const MedicalHistory = lazy(() => import('./pages/patient/MedicalHistory'));
const Prescriptions = lazy(() => import('./pages/patient/Prescriptions'));
const Messages = lazy(() => import('./pages/patient/Messages'));
const UploadPayment = lazy(() => import('./pages/patient/UploadPayment'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'));
const DoctorClinics = lazy(() => import('./pages/doctor/DoctorClinics'));
const DoctorSchedules = lazy(() => import('./pages/doctor/DoctorSchedules'));
const DoctorPrescriptions = lazy(() => import('./pages/doctor/DoctorPrescriptions'));
const DoctorMessages = lazy(() => import('./pages/doctor/DoctorMessages'));
const DoctorProfilePage = lazy(() => import('./pages/doctor/DoctorProfile'));
const DoctorAssistants = lazy(() => import('./pages/doctor/DoctorAssistants'));
const AssistantDashboard = lazy(() => import('./pages/assistant/AssistantDashboard'));
const AssistantAppointments = lazy(() => import('./pages/assistant/AssistantAppointments'));
const AssistantPayments = lazy(() => import('./pages/assistant/AssistantPayments'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const AddDoctor = lazy(() => import('./pages/admin/AddDoctor'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));

const roleHome = {
  patient: '/patient',
  doctor: '/doctor',
  assistant: '/assistant',
  admin: '/admin',
  super_admin: '/superadmin',
};

const hiddenNavbarPrefixes = ['/patient', '/doctor', '/assistant', '/admin', '/superadmin', '/notifications'];

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={roleHome[user.role] || '/'} replace />;

  return children;
}

function Landing() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={roleHome[user.role] || '/'} replace />;

  return <Home />;
}

function App() {
  const location = useLocation();
  const showNavbar = !hiddenNavbarPrefixes.some((prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)) && !location.pathname.endsWith('/book');

  return (
    <>
      <SEO {...getSeoForPath(location.pathname)} />
      {showNavbar && <Navbar />}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorProfile />} />
          <Route path="/doctors/:id/book" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
          <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          <Route path="/patient" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute roles={['patient']}><Appointments /></ProtectedRoute>} />
          <Route path="/patient/book" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute roles={['patient']}><Prescriptions /></ProtectedRoute>} />
          <Route path="/patient/history" element={<ProtectedRoute roles={['patient']}><MedicalHistory /></ProtectedRoute>} />
          <Route path="/patient/messages" element={<ProtectedRoute roles={['patient']}><Messages /></ProtectedRoute>} />
          <Route path="/patient/payments/:id" element={<ProtectedRoute roles={['patient']}><UploadPayment /></ProtectedRoute>} />

          <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/clinics" element={<ProtectedRoute roles={['doctor']}><DoctorClinics /></ProtectedRoute>} />
          <Route path="/doctor/schedules" element={<ProtectedRoute roles={['doctor']}><DoctorSchedules /></ProtectedRoute>} />
          <Route path="/doctor/prescriptions" element={<ProtectedRoute roles={['doctor']}><DoctorPrescriptions /></ProtectedRoute>} />
          <Route path="/doctor/messages" element={<ProtectedRoute roles={['doctor']}><DoctorMessages /></ProtectedRoute>} />
          <Route path="/doctor/profile" element={<ProtectedRoute roles={['doctor']}><DoctorProfilePage /></ProtectedRoute>} />
          <Route path="/doctor/assistants" element={<ProtectedRoute roles={['doctor']}><DoctorAssistants /></ProtectedRoute>} />

          <Route path="/assistant" element={<ProtectedRoute roles={['assistant']}><AssistantDashboard /></ProtectedRoute>} />
          <Route path="/assistant/appointments" element={<ProtectedRoute roles={['assistant']}><AssistantAppointments /></ProtectedRoute>} />
          <Route path="/assistant/payments" element={<ProtectedRoute roles={['assistant']}><AssistantPayments /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin', 'super_admin']}><Analytics /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin', 'super_admin']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute roles={['admin', 'super_admin']}><AddDoctor /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={['admin', 'super_admin']}><Reports /></ProtectedRoute>} />

          <Route path="/superadmin" element={<ProtectedRoute roles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/superadmin/analytics" element={<ProtectedRoute roles={['super_admin']}><Analytics /></ProtectedRoute>} />
          <Route path="/superadmin/users" element={<ProtectedRoute roles={['super_admin']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/superadmin/reports" element={<ProtectedRoute roles={['super_admin']}><Reports /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
