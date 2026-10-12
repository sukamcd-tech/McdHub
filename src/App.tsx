import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages (1:1 with original design)
import { HomePage } from './pages/public/HomePage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { PricingPage } from './pages/public/PricingPage';
import { OrderPage } from './pages/public/OrderPage';
import { ContactPage } from './pages/public/ContactPage';
import { McdWalletPage } from './pages/public/McdWalletPage';
import { McdWalletDownloadPage } from './pages/public/McdWalletDownloadPage';
import { McdWalletPrivacyPage } from './pages/public/McdWalletPrivacyPage';
import { GatewayPage } from './pages/public/GatewayPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ProfilePage } from './pages/public/ProfilePage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
