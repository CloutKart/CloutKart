import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import CursorGlow from './components/CursorGlow';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MessageFirst from './components/MessageFirst';
import About from './components/About';
import Services from './components/Services';
import Process from './components/Process';
import ScrollStory from './components/ScrollStory';
import Pricing from './components/Pricing';
import Portfolio from './components/Portfolio';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SignupModal from './components/SignupModal';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

function ProtectedDashboard() {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Dashboard />;
}

function ProtectedAdmin() {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Admin />;
}

function LandingPage({ onSignupOpen }: { onSignupOpen: () => void }) {
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--scroll-offset', String(window.scrollY));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <LoadingScreen />
      <CursorGlow />
      <div className="relative">
        <div className="noise-overlay" />
        <Navbar onSignupOpen={onSignupOpen} />
        <main>
          <Hero onSignupOpen={onSignupOpen} />
          <MessageFirst />
          <About />
          <Services />
          <ScrollStory />
          <Process />
          <Pricing />
          <Portfolio />
          <FAQ />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}

function AppRoutes() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <SignupModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Routes>
        <Route path="/" element={<LandingPage onSignupOpen={() => setModalOpen(true)} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="/admin" element={<ProtectedAdmin />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
