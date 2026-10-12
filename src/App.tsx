import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages (1:1 with original design)
import { HomePage } from './pages/public/HomePage';
import { ProjectsPage as PublicProjectsPage } from './pages/public/ProjectsPage';
import { PricingPage } from './pages/public/PricingPage';
import { OrderPage } from './pages/public/OrderPage';
import { ContactPage } from './pages/public/ContactPage';
import { McdWalletPage } from './pages/public/McdWalletPage';
import { McdWalletDownloadPage } from './pages/public/McdWalletDownloadPage';
import { McdWalletPrivacyPage } from './pages/public/McdWalletPrivacyPage';
import { GatewayPage } from './pages/public/GatewayPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ProfilePage } from './pages/public/ProfilePage';

// Admin Layout & Pages (1:1 with original cyber administration)
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { OrdersPage } from './pages/admin/OrdersPage';
import { ProjectsPage as AdminProjectsPage } from './pages/admin/ProjectsPage';
import { PromosPage } from './pages/admin/PromosPage';
import { AppsPage } from './pages/admin/AppsPage';
import { McdCryptPage } from './pages/admin/McdCryptPage';
import { McdAIPage } from './pages/admin/McdAIPage';
import { FeedbackPage } from './pages/admin/FeedbackPage';
import { BackupPage } from './pages/admin/BackupPage';
import { LogsPage } from './pages/admin/LogsPage';
import { SecurityPage } from './pages/admin/SecurityPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { ClientProjectsPage } from './pages/admin/ClientProjectsPage';
import { BusinessOverviewPage } from './pages/admin/BusinessOverviewPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<PublicProjectsPage />} />
        <Route path="/projects/mcdwallet" element={<McdWalletPage />} />
        <Route path="/projects/mcdwallet/download" element={<McdWalletDownloadPage />} />
        <Route path="/projects/mcdwallet/privacy" element={<McdWalletPrivacyPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/pricing/order" element={<OrderPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Auth Gateway */}
        <Route path="/gateway" element={<GatewayPage />} />
        <Route path="/gateway/register" element={<RegisterPage />} />

        {/* Admin Portal (Protected by AdminLayout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="promos" element={<PromosPage />} />
          <Route path="apps" element={<AppsPage />} />
          <Route path="business-overview" element={<BusinessOverviewPage />} />
          <Route path="client-projects" element={<ClientProjectsPage />} />
          <Route path="mcdcrypt" element={<McdCryptPage />} />
          <Route path="mcdai" element={<McdAIPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="backup" element={<BackupPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
