import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import MainLayout from "../components/MainLayout/MainLayout";
import PublicLayout from "../components/PublicLayout/PublicLayout";

import LoginPage from "../pages/Login/LoginPage";
import TwoFactorPage from "../pages/Login/TwoFactorPage";
import ForgotPasswordPage from "../pages/PasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "../pages/PasswordPage/ResetPasswordPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import DoctorsPage from "../pages/Doctors/DoctorsPage";
import PatientsPage from "../pages/Patients/PatientsPage";
import StaffPage from "../pages/Staff/StaffPage";
import AppointmentsPage from "../pages/Appointments/AppointmentsPage";
import DepartmentsPage from "../pages/Departments/DepartmentsPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import MyAppointmentsPage from "../pages/Appointments/MyAppointmentsPage";
import ChatPage from "../pages/Chat/ChatPage";
import SymptomCheckerPage from "../pages/SymptomChecker/SymptomCheckerPage";
import AppointmentRequestsPage from "../pages/AppointmentRequests/AppointmentRequestsPage";
import EducationPage from "../pages/Education/EducationPage";
import LandingPage from "../pages/Public/LandingPage";
import PublicDoctorsPage from "../pages/Public/PublicDoctorsPage";
import PublicDepartmentsPage from "../pages/Public/PublicDepartmentsPage";
import AboutPage from "../pages/Public/AboutPage";
import AnalyticsPage from "../pages/Analytics/AnalyticsPage";
import QueueDisplay from "../pages/Queue/QueueDisplay";
import QueueManagement from "../pages/Queue/QueueManagement";
import DoctorPanel from "../pages/Queue/DoctorPanel";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import AuditPage from "../pages/Audit/AuditPage";
import PatientPortalPage from "../pages/PatientPortal/PatientPortalPage";
import SchedulePage from "../pages/Schedule/SchedulePage";
import PharmacyPage from "../pages/Pharmacy/PharmacyPage";
import PublicPharmacyPage from "../pages/Public/PublicPharmacyPage";

import useTokenStore from "../stores/tokenStore";

const AppRouter = () => {
  const { accessToken } = useTokenStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={accessToken ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/two-factor" element={accessToken ? <Navigate to="/dashboard" replace /> : <TwoFactorPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Public standalone */}
        <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/queue-display" element={<QueueDisplay />} />
        <Route path="/patient-portal" element={<PatientPortalPage />} />

        {/* Public pages with PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={accessToken ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/our-doctors" element={<PublicDoctorsPage />} />
          <Route path="/our-departments" element={<PublicDepartmentsPage />} />
          <Route path="/pharmacy-info" element={<PublicPharmacyPage />} />
        </Route>

        {/* Private routes */}
        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="analytics" element={<RoleRoute allowedRoles={["Admin", "Receptionist"]}><AnalyticsPage /></RoleRoute>} />
          <Route path="patients" element={<RoleRoute allowedRoles={["Admin", "Receptionist"]}><PatientsPage /></RoleRoute>} />
          <Route path="appointments" element={<RoleRoute allowedRoles={["Admin", "Receptionist"]}><AppointmentsPage /></RoleRoute>} />
          <Route path="appointment-requests" element={<RoleRoute allowedRoles={["Admin", "Receptionist"]}><AppointmentRequestsPage /></RoleRoute>} />
          <Route path="doctors" element={<RoleRoute allowedRoles={["Admin"]}><DoctorsPage /></RoleRoute>} />
          <Route path="staff" element={<RoleRoute allowedRoles={["Admin"]}><StaffPage /></RoleRoute>} />
          <Route path="departments" element={<RoleRoute allowedRoles={["Admin"]}><DepartmentsPage /></RoleRoute>} />
          <Route path="my-appointments" element={<RoleRoute allowedRoles={["Doctor"]}><MyAppointmentsPage /></RoleRoute>} />
          <Route path="queue-management" element={<RoleRoute allowedRoles={["Admin", "Receptionist"]}><QueueManagement /></RoleRoute>} />
          <Route path="doctor-panel" element={<RoleRoute allowedRoles={["Admin", "Doctor"]}><DoctorPanel /></RoleRoute>} />
          <Route path="audit" element={<RoleRoute allowedRoles={["Admin"]}><AuditPage /></RoleRoute>} />
          <Route path="schedule" element={<RoleRoute allowedRoles={["Admin", "Receptionist"]}><SchedulePage /></RoleRoute>} />
          <Route path="pharmacy" element={<RoleRoute allowedRoles={["Admin", "Pharmacist"]}><PharmacyPage /></RoleRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;