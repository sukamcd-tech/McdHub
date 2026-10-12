import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Terminal, 
  Layers, 
  Smartphone, 
  Tag, 
  MessageSquare, 
  LogIn, 
  Menu, 
  X, 
  ShieldCheck,
  User
} from 'lucide-react';
import { api } from '@/lib/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    api.auth.session()
      .then((res) => {
        if (res?.user) setCurrentUser(res.user);
      })
      .catch(() => setCurrentUser(null));
  }, [location.pathname]);

  const navLinks = [
    { name: 'Beranda', path: '/', icon: Terminal },
    { name: 'Proyek', path: '/projects', icon: Layers },
    { name: 'McdWallet', path: '/projects/mcdwallet', icon: Smartphone },
    { name: 'Paket & Harga', path: '/pricing', icon: Tag },
    { name: 'Kontak & Saran', path: '/contact', icon: MessageSquare },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(11, 12, 16, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div className="container-custom" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.svg" alt="SukaMCD Logo" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: 'var(--silver-50)' }}>
              Suka<span style={{ color: 'var(--cyan)' }}>MCD</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--silver-500)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Digital Engineering
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--silver-50)' : 'var(--silver-400)',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  border: isActive ? '1px solid var(--border-med)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} color={isActive ? 'var(--cyan)' : 'currentColor'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {currentUser ? (
            <Link
              to={currentUser.role === 'admin' ? '/admin/dashboard' : '/pricing/order'}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              {currentUser.role === 'admin' ? <ShieldCheck size={16} color="var(--cyan)" /> : <User size={16} />}
              <span>{currentUser.name || currentUser.username || 'Akun'}</span>
            </Link>
          ) : (
            <Link
              to="/gateway"
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              <LogIn size={15} />
              <span>Gateway</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--silver-300)',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
            }}
            className="mobile-toggle"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-med)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  color: isActive ? 'var(--cyan)' : 'var(--silver-200)',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                }}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};
