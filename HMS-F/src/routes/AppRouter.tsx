import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { ReceptionistDashboard } from "@/features/receptionist/pages/ReceptionistDashboard";
import { DoctorDashboard } from "@/features/doctors/pages/DoctorDashboard";
import { DoctorProfilePage } from "@/features/doctors/pages/DoctorProfilePage";
import { LoginPage } from "@/pages/LoginPage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { AppointmentsPage } from "@/pages/AppointmentsPage";
import { DoctorsPage } from "@/pages/DoctorsPage";
import { MedicalRecordsPage } from "@/pages/MedicalRecordsPage";
import { PatientsPage } from "@/pages/PatientsPage";
import { BillingPage } from "@/pages/BillingPage";
import { DepartmentsPage } from "@/pages/DepartmentsPage";
import { BookAppointmentPage } from "@/pages/BookAppointmentPage";
import { UsersPage } from "@/pages/UsersPage";
import RoomsPage from "@/features/rooms/pages/RoomsPage";
import { AdmissionsPage } from "@/pages/AdmissionsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { HelpPage } from "@/pages/HelpPage";
import { useAuthStore } from "@/store/useAuthStore";

// Placeholder pages — will be replaced with real feature pages later
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="text-muted-foreground">This page is under construction.</p>
      <div className="h-64 rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Content coming soon</span>
      </div>
    </div>
  );
}

// ─── Role-based Dashboard Selector ────────────────────────────────────────────
// Renders a dashboard tailored to the logged-in user's role.
// Admin  → full KPI overview        (DashboardPage)
// Receptionist → reception-specific  (ReceptionistDashboard)
// Others → default overview          (DashboardPage)
function RoleDashboard() {
  const role = useAuthStore((s) => s.role);

  if (role === "ROLE_RECEPTIONIST") return <ReceptionistDashboard />;
  if (role === "ROLE_DOCTOR") return <DoctorDashboard />;
  // ROLE_ADMIN and others use the default dashboard
  return <DashboardPage />;
}

export function AppRouter() {
  // ─── Role Groups ────────────────────────────────────────────────────────────
  // Keep role arrays here — single source of truth for access control
  const allRoles = ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST', 'ROLE_ACCOUNTANT', 'ROLE_NURSE'];
  const adminDoctorStaff = ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST'];
  const adminDoctor = ['ROLE_ADMIN', 'ROLE_DOCTOR'];
  const adminReceptionist = ['ROLE_ADMIN', 'ROLE_RECEPTIONIST'];
  const adminDoctorNurse = ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE'];
  const billingRoles = ['ROLE_ADMIN', 'ROLE_RECEPTIONIST', 'ROLE_ACCOUNTANT'];
  const patientRoles = ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST', 'ROLE_ACCOUNTANT', 'ROLE_NURSE'];
  const clinicalReadOnlyRoles = ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST', 'ROLE_NURSE'];
  const fullClinicalWithAccountant = ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST', 'ROLE_NURSE', 'ROLE_ACCOUNTANT'];

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* All protected routes — auth check only at this level */}
      <Route element={<ProtectedRoute />}>
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Dashboard Layout wraps all inner routes */}
        <Route element={<DashboardLayout />}>

          {/* ── Dashboard ────────────────────────────────────────────────── */}
          {/* FIX: index renders DashboardPage at "/", sidebar links to "/dashboard"
              Both work — "/" and "/dashboard" both show DashboardPage */}
          <Route index element={
            <ProtectedRoute allowedRoles={allRoles}>
              <RoleDashboard />
            </ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={allRoles}>
              <RoleDashboard />
            </ProtectedRoute>
          } />

          {/* ── Appointments ─────────────────────────────────────────────── */}
          <Route path="appointments" element={
            <ProtectedRoute allowedRoles={fullClinicalWithAccountant}>
              <AppointmentsPage />
            </ProtectedRoute>
          } />
          {/* FIX: DOCTOR must also be able to book appointments */}
          <Route path="appointments/new" element={
            <ProtectedRoute allowedRoles={adminDoctorStaff}>
              <BookAppointmentPage />
            </ProtectedRoute>
          } />

          {/* ── Patients ─────────────────────────────────────────────────── */}
          <Route path="patients" element={
            <ProtectedRoute allowedRoles={patientRoles}>
              <PatientsPage />
            </ProtectedRoute>
          } />
          <Route path="patients/:id" element={
            <ProtectedRoute allowedRoles={patientRoles}>
              <PlaceholderPage title="Patient Profile" />
            </ProtectedRoute>
          } />

          {/* ── Doctors ──────────────────────────────────────────────────── */}
          {/* CRITICAL FIX: specific routes MUST come before dynamic :id routes
              otherwise /doctors/me is caught by /doctors/:id and never matches */}
          <Route path="doctors/me" element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <DoctorProfilePage />
            </ProtectedRoute>
          } />
          {/* FIX: RECEPTIONIST needs to see doctors list to book appointments */}
          <Route path="doctors" element={
            <ProtectedRoute allowedRoles={clinicalReadOnlyRoles}>
              <DoctorsPage />
            </ProtectedRoute>
          } />
          <Route path="doctors/:id" element={
            <ProtectedRoute allowedRoles={clinicalReadOnlyRoles}>
              <PlaceholderPage title="Doctor Profile" />
            </ProtectedRoute>
          } />

          {/* ── Medical Records ───────────────────────────────────────────── */}
          {/* specific /my route before dynamic routes */}
          <Route path="medical-records/my" element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <PlaceholderPage title="My Patient Records" />
            </ProtectedRoute>
          } />
          {/* ADMIN sees all records, DOCTOR sees their own — handled inside MedicalRecordsPage */}
          <Route path="medical-records" element={
            <ProtectedRoute allowedRoles={adminDoctorNurse}>
              <MedicalRecordsPage />
            </ProtectedRoute>
          } />

          {/* ── Billing & Invoices ────────────────────────────────────────── */}
          {/* FIX: use RECEPTIONIST not ACCOUNTANT — matches SecurityConfig */}
          <Route path="billing" element={
            <ProtectedRoute allowedRoles={billingRoles}>
              <BillingPage />
            </ProtectedRoute>
          } />

          {/* ── Departments ───────────────────────────────────────────────── */}
          {/* All clinical staff can view — only ADMIN can manage (enforced by backend) */}
          <Route path="departments" element={
            <ProtectedRoute allowedRoles={fullClinicalWithAccountant}>
              <DepartmentsPage />
            </ProtectedRoute>
          } />

          {/* ── Rooms & Beds ──────────────────────────────────────────────── */}
          <Route path="rooms" element={
            <ProtectedRoute allowedRoles={fullClinicalWithAccountant}>
              <RoomsPage />
            </ProtectedRoute>
          } />

          {/* ── Admissions ────────────────────────────────────────────────── */}
          <Route path="admissions" element={
            <ProtectedRoute allowedRoles={fullClinicalWithAccountant}>
              <AdmissionsPage />
            </ProtectedRoute>
          } />

          {/* ── Administration (ADMIN only) ───────────────────────────────── */}
          <Route path="users" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_ACCOUNTANT']}>
              <ReportsPage />
            </ProtectedRoute>
          } />
          <Route path="analytics" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <PlaceholderPage title="Analytics" />
            </ProtectedRoute>
          } />

          {/* ── Settings (all authenticated roles) ───────────────────────── */}
          <Route path="settings" element={
            <ProtectedRoute allowedRoles={allRoles}>
              <SettingsPage />
            </ProtectedRoute>
          } />

          {/* ── Help & Support ───────────────────────────────────────────── */}
          <Route path="help" element={
            <ProtectedRoute allowedRoles={allRoles}>
              <HelpPage />
            </ProtectedRoute>
          } />

        </Route>
      </Route>

      {/* Catch-all: redirect unknown paths to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}