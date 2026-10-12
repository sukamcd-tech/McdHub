import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-surface)',
      padding: '3.5rem 0 2rem 0',
    }}>
      <div className="container-custom">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <img src="/logo.svg" alt="SukaMCD" style={{ width: '28px', height: '28px' }} />
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--silver-100)' }}>
                Suka<span style={{ color: 'var(--cyan)' }}>MCD</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--silver-400)', maxWidth: '280px', marginBottom: '1.2rem' }}>
              Solusi digital engineering presisi tinggi. Pembuatan website dinamis, aplikasi Android native, sistem ERP, dan asistensi AI terpadu.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="pulse-dot"></span>
              <span style={{ fontSize: '0.775rem', color: 'var(--emerald)', fontWeight: 600 }}>
                Cloudflare D1 & Edge Engine Active
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--silver-100)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Navigasi
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <Link to="/projects" style={{ color: 'var(--silver-400)' }}>Portofolio Proyek</Link>
              <Link to="/projects/mcdwallet" style={{ color: 'var(--silver-400)' }}>Aplikasi McdWallet</Link>
              <Link to="/pricing" style={{ color: 'var(--silver-400)' }}>Paket & Biaya Pembuatan</Link>
              <Link to="/contact" style={{ color: 'var(--silver-400)' }}>Form Bug & Saran</Link>
            </div>
          </div>

          {/* Legal & Security */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--silver-100)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Keamanan & Dukungan
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <Link to="/projects/mcdwallet/privacy" style={{ color: 'var(--silver-400)' }}>Kebijakan Privasi McdWallet</Link>
              <Link to="/gateway" style={{ color: 'var(--silver-400)' }}>Portal Akses Gateway</Link>
              <a href="https://wa.me/6288905588200" target="_blank" rel="noreferrer" style={{ color: 'var(--silver-400)' }}>
                Dukungan WhatsApp (+62 889-0558-8200)
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--silver-500)',
        }}>
          <div>
            &copy; {new Date().getFullYear()} SukaMCD Technologies. All rights reserved. Built with React + Vite + Hono + D1.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Made with precision by Fabian</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
