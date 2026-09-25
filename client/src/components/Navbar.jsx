import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';
import { MatrixModal } from './MatrixModal';
import { authService, setToken } from '../services/api';
import { 
  ShieldCheck, 
  LogOut, 
  Table, 
  Clock,
  ExternalLink
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [showMatrix, setShowMatrix] = useState(false);
  const [showTabMenu, setShowTabMenu] = useState(false);

  const handleSimulateExpiry = async () => {
    try {
      const res = await authService.getExpiredTestToken(user?.email);
      if (res.ok && res.data.token) {
        setToken(res.data.token);
        // Dispatch test event
        window.dispatchEvent(new CustomEvent('rbac:session_expired', {
          detail: {
            code: 'TOKEN_EXPIRED',
            message: 'Session expiration simulated (TC-05). Re-authentication required.'
          }
        }));
      }
    } catch (e) {
      console.error('Expiry test error:', e);
    }
  };

  return (
    <>
      <nav 
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0.875rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo & Portal Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.35)'
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>
                  Secure College Portal
                </span>
                <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 700 }}>
                  RBAC
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Role-Based Access Control Academic Platform
              </div>
            </div>
          </div>

          {/* User Controls & Multi-Tab Utilities */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              
              {/* Quick Multi-Tab Launcher for Simultaneous Portals */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowTabMenu(!showTabMenu)}
                  className="btn btn-secondary btn-sm"
                  style={{ borderColor: 'rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Open another portal in a separate browser tab for simultaneous multi-role testing"
                >
                  <ExternalLink size={13} color="#818cf8" />
                  <span style={{ fontSize: '0.8125rem' }}>New Tab ↗</span>
                </button>

                {showTabMenu && (
                  <div 
                    className="glass-card animate-fade-in"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '230px',
                      padding: '0.625rem',
                      zIndex: 200,
                      background: 'rgba(15, 23, 42, 0.95)'
                    }}
                  >
                    <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                      Open in Separate Tab:
                    </div>
                    
                    <button 
                      onClick={() => { window.open('/?portal=student', '_blank'); setShowTabMenu(false); }}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.375rem', fontSize: '0.8125rem' }}
                    >
                      🎓 Student Portal ↗
                    </button>

                    <button 
                      onClick={() => { window.open('/?portal=faculty', '_blank'); setShowTabMenu(false); }}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.375rem', fontSize: '0.8125rem' }}
                    >
                      💼 Faculty Portal ↗
                    </button>

                    <button 
                      onClick={() => { window.open('/?portal=admin', '_blank'); setShowTabMenu(false); }}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8125rem' }}
                    >
                      🛡️ Admin Console ↗
                    </button>
                  </div>
                )}
              </div>

              {/* RBAC Matrix Viewer Button */}
              <button 
                onClick={() => setShowMatrix(true)}
                className="btn btn-secondary btn-sm"
                title="View Role-Permission Matrix"
              >
                <Table size={14} />
                <span>RBAC Matrix</span>
              </button>

              {/* TC-05 Session Expiry Simulation Trigger */}
              <button 
                onClick={handleSimulateExpiry}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
                title="Test TC-05: Force Session Expiry & Re-authentication"
              >
                <Clock size={14} />
                <span>Test Expiry (TC-05)</span>
              </button>

              {/* Current User Badge & Logout */}
              <div style={{ height: '24px', width: '1px', background: 'var(--border-color)', margin: '0 0.25rem' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
                <RoleBadge role={user.role} />
              </div>

              <button 
                onClick={logout}
                className="btn btn-secondary btn-sm"
                title="Log Out (Terminates Session in this tab)"
                style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <LogOut size={15} />
                <span style={{ fontSize: '0.8125rem' }}>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* RBAC Matrix Modal */}
      <MatrixModal isOpen={showMatrix} onClose={() => setShowMatrix(false)} />
    </>
  );
};

export default Navbar;
