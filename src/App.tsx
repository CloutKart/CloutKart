import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoadingScreen from './components/LoadingScreen';
import CursorGlow from './components/CursorGlow';
import TelemetryFrame from './components/TelemetryFrame';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import MessageFirst from './components/MessageFirst';
import Services from './components/Services';
import Process from './components/Process';
import Marquee from './components/Marquee';
import ScrollStory from './components/ScrollStory';
import PixieSection from './components/PixieSection';
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
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
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

  // Safety net: never let reveal-gated content stay hidden (headless renderers,
  // SEO crawlers, background tabs, or a missed IntersectionObserver). Normal
  // scrolling still triggers the staggered reveal first; this only catches strays.
  useEffect(() => {
    const t = window.setTimeout(() => {
      document
        .querySelectorAll('.reveal, .reveal-scale, .reveal-clip')
        .forEach((el) => el.classList.add('visible'));
    }, 2500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <LoadingScreen />
      <div className="relative">
        <div className="noise-overlay" />
        <TelemetryFrame />
        <Navbar onSignupOpen={onSignupOpen} />
        <main>
          <Hero onSignupOpen={onSignupOpen} />
          <Marquee />
          <About />
          <MessageFirst />
          <PixieSection onSignupOpen={onSignupOpen} />
          <ScrollStory />
          <Services />
          <Process />
          <Pricing onSignupOpen={onSignupOpen} />
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
      <CursorGlow />
      <SignupModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Routes>
        <Route path="/" element={<LandingPage onSignupOpen={() => setModalOpen(true)} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<div data-theme="dark"><ProtectedDashboard /></div>} />
        <Route path="/admin" element={<div data-theme="dark"><ProtectedAdmin /></div>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
