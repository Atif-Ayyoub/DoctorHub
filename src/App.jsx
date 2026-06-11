import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/public/Home';
import Doctors from './pages/public/Doctors';
import DoctorProfile from './pages/public/DoctorProfile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Notifications from './pages/notifications/Notifications';
import PatientDashboard from './pages/patient/PatientDashboard';
import Appointments from './pages/patient/Appointments';
import BookAppointment from './pages/patient/BookAppointment';
import MedicalHistory from './pages/patient/MedicalHistory';
import Prescriptions from './pages/patient/Prescriptions';
import Messages from './pages/patient/Messages';
import UploadPayment from './pages/patient/UploadPayment';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorClinics from './pages/doctor/DoctorClinics';
import DoctorSchedules from './pages/doctor/DoctorSchedules';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorMessages from './pages/doctor/DoctorMessages';
import DoctorProfilePage from './pages/doctor/DoctorProfile';
import DoctorAssistants from './pages/doctor/DoctorAssistants';
import AssistantDashboard from './pages/assistant/AssistantDashboard';
import AssistantAppointments from './pages/assistant/AssistantAppointments';
import AssistantPayments from './pages/assistant/AssistantPayments';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import AddDoctor from './pages/admin/AddDoctor';
import Reports from './pages/admin/Reports';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

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
      {showNavbar && <Navbar />}
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
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin', 'super_admin']}><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/doctors" element={<ProtectedRoute roles={['admin', 'super_admin']}><AddDoctor /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={['admin', 'super_admin']}><Reports /></ProtectedRoute>} />

        <Route path="/superadmin" element={<ProtectedRoute roles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/superadmin/users" element={<ProtectedRoute roles={['super_admin']}><ManageUsers /></ProtectedRoute>} />
        <Route path="/superadmin/reports" element={<ProtectedRoute roles={['super_admin']}><Reports /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
