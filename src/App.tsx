import React from 'react';
import { LabPulseProvider, useLabPulse } from './context/LabPulseContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { LabSpaceModule } from './components/labs/LabSpaceModule';
import { HardwareLendingModule } from './components/hardware/HardwareLendingModule';
import { MyPassesModule } from './components/student/MyPassesModule';
import { SupervisorModule } from './components/supervisor/SupervisorModule';
import { OfficerScanStation } from './components/admin/OfficerScanStation';
import { SmartWaitlistModule } from './components/waitlist/SmartWaitlistModule';
import { TelemetryModule } from './components/telemetry/TelemetryModule';
import { AuditTrailModule } from './components/audit/AuditTrailModule';
import { MessagesModule } from './components/notifications/MessagesModule';
import { ReportsManagementModule } from './components/admin/ReportsManagementModule';
import { ReportDefectModal } from './components/maintenance/ReportDefectModal';
import { FloatingReportButton } from './components/common/FloatingReportButton';
import { AuthPage } from './components/auth/AuthPage';

const MainContent: React.FC = () => {
  const { activeTab } = useLabPulse();

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 transition-all duration-300">
      {activeTab === 'labs' && <LabSpaceModule />}
      {activeTab === 'hardware' && <HardwareLendingModule />}
      {activeTab === 'my-passes' && <MyPassesModule />}
      {activeTab === 'messages' && <MessagesModule />}
      {activeTab === 'supervisor' && <SupervisorModule />}
      {activeTab === 'officer-station' && <OfficerScanStation />}
      {activeTab === 'reports' && <ReportsManagementModule />}
      {activeTab === 'waitlist' && <SmartWaitlistModule />}
      {activeTab === 'telemetry' && <TelemetryModule />}
      {activeTab === 'audit' && <AuditTrailModule />}
    </main>
  );
};

const AppContainer: React.FC = () => {
  const { isAuthenticated } = useLabPulse();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <AuthPage />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Floating Apple-Style Dynamic Navbar */}
      <Navbar />

      {/* Dynamic Main Workspace Module */}
      <MainContent />

      {/* Defect Reporting Modal (Triggered by [REPORT DEFECT] button) */}
      <ReportDefectModal />

      {/* Floating Circle Report Defect Button (Students, Lecturers & Officers) */}
      <FloatingReportButton />

      {/* Global Toast Alerts */}
      <ToastContainer />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LabPulseProvider>
      <AppContainer />
    </LabPulseProvider>
  );
};

export default App;

