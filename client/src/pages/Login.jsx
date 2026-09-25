import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SecurityAlert } from '../components/SecurityAlert';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  ShieldAlert, 
  GraduationCap, 
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

const PORTALS = {
  student: {
    id: 'student',
    name: 'Student Portal',
    title: 'Student Academic Portal',
    subtitle: 'Access your enrolled subjects, academic marks, and attendance records',
    badge: 'Student Authorization',
    badgeColor: 'rgba(6, 182, 212, 0.15)',
    badgeTextColor: '#22d3ee',
    gradient: 'linear-gradient(135deg, #06b6d4, #6366f1)',
    glow: '0 0 25px rgba(6, 182, 212, 0.25)',
    icon: GraduationCap,
    emailLabel: 'Student Institutional Email',
    emailPlaceholder: 'student1@college.local',
    defaultEmail: 'student1@college.local',
    defaultPassword: 'Student@12345',
    buttonText: 'Sign In to Student Dashboard',
    infoNote: 'Restricted to enrolled university students. Directs to personal academic dashboard.'
  },
  faculty: {
    id: 'faculty',
    name: 'Faculty Portal',
    title: 'Faculty Instructional Portal',
    subtitle: 'Manage departmental rosters, grade submissions, and academic evaluations',
    badge: 'Faculty Clearance',
    badgeColor: 'rgba(168, 85, 247, 0.15)',
    badgeTextColor: '#c084fc',
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    glow: '0 0 25px rgba(139, 92, 246, 0.25)',
    icon: Briefcase,
    emailLabel: 'Faculty Academic Email',
    emailPlaceholder: 'faculty@college.local',
    defaultEmail: 'faculty@college.local',
    defaultPassword: 'Faculty@12345',
    buttonText: 'Sign In to Faculty Dashboard',
    infoNote: 'Restricted to departmental teaching faculty. Directs to course grading and roster dashboard.'
  },
  admin: {
    id: 'admin',
    name: 'Administrator Portal',
    title: 'Administrator Security Console',
    subtitle: 'Access RBAC governance, live audit trails, and account lifecycle controls',
    badge: 'SecOps Admin Clearance',
    badgeColor: 'rgba(245, 158, 11, 0.15)',
    badgeTextColor: '#fbbf24',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    glow: '0 0 25px rgba(245, 158, 11, 0.25)',
    icon: ShieldAlert,
    emailLabel: 'SecOps Administrator Email',
    emailPlaceholder: 'admin@college.local',
    defaultEmail: 'admin@college.local',
    defaultPassword: 'Admin@12345',
    buttonText: 'Sign In to Administrator Console',
    infoNote: 'High-privilege security clearance required. Directs to administrative audit and RBAC management.'
  }
};

export const Login = () => {
  const { login, logout, sessionExpiredAlert, dismissSessionAlert } = useAuth();
  
  const getInitialPortal = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const portalParam = params.get('portal');
      if (portalParam && PORTALS[portalParam]) {
        return portalParam;
      }
      const sessionPortal = sessionStorage.getItem('rbac_portal');
      if (sessionPortal && PORTALS[sessionPortal]) {
        return sessionPortal;
      }
    } catch (e) {}
    return 'student';
  };

  const [activePortal, setActivePortalState] = useState(getInitialPortal);
  const [email, setEmail] = useState(() => PORTALS[getInitialPortal()]?.defaultEmail || '');
  const [password, setPassword] = useState(() => PORTALS[getInitialPortal()]?.defaultPassword || '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorAlert, setErrorAlert] = useState(null);

  // Sync credentials when active portal changes
  const handleSelectPortal = (portalId) => {
    setActivePortalState(portalId);
    setEmail(PORTALS[portalId].defaultEmail);
    setPassword(PORTALS[portalId].defaultPassword);
    setErrorAlert(null);

    try {
      sessionStorage.setItem('rbac_portal', portalId);
      const url = new URL(window.location);
      url.searchParams.set('portal', portalId);
      window.history.replaceState({}, '', url);
    } catch (e) {
      // Ignored in test environments
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorAlert(null);

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorAlert({
        type: 'denied',
        statusCode: res.code === 'ACCOUNT_DISABLED' ? 403 : 401,
        title: res.code === 'ACCOUNT_DISABLED' ? 'Account Deactivated (TC-09)' : 'Authentication Failed',
        message: res.message || 'Invalid credentials provided.',
        details: res.code ? `Security Rejection Code: ${res.code}` : null
      });
      return;
    }

    // Role Verification: Enforce separate login segregation
    if (res.user && res.user.role !== activePortal) {
      // Role mismatch: Account authenticated but does not match the active portal
      const actualRole = res.user.role;
      const expectedPortalName = PORTALS[activePortal].name;
      const actualPortalName = PORTALS[actualRole]?.name || actualRole;

      await logout();

      setErrorAlert({
        type: 'denied',
        statusCode: 403,
        title: 'Portal Role Mismatch',
        message: `Access Denied: This login portal is strictly reserved for ${expectedPortalName} users. Your authenticated account holds the '${actualRole.toUpperCase()}' role.`,
        details: `Redirecting required: Please sign in through the ${actualPortalName}.`
      });
    }
    // If role matches, App.jsx automatically directs the user to their respective dashboard!
  };

  const portalConfig = PORTALS[activePortal];
  const PortalIcon = portalConfig.icon;

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      
      {/* 3 Dedicated Role Portal Selectors with Multi-Tab Launcher */}
      <div style={{ width: '100%', maxWidth: '480px', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem', padding: '0 0.25rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Select Role Portal:
          </div>
          <button
            type="button"
            onClick={() => window.open(`/?portal=${activePortal}`, '_blank')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            title="Open current portal in a separate browser tab for simultaneous testing"
          >
            <ExternalLink size={12} />
            <span>Open Tab ↗</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
          {Object.values(PORTALS).map((portal) => {
            const Icon = portal.icon;
            const isSelected = activePortal === portal.id;
            return (
              <button
                key={portal.id}
                type="button"
                onClick={() => handleSelectPortal(portal.id)}
                style={{
                  position: 'relative',
                  background: isSelected ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSelected 
                    ? `2px solid ${portal.id === 'student' ? '#06b6d4' : portal.id === 'faculty' ? '#a855f7' : '#f59e0b'}` 
                    : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '0.75rem 0.5rem',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? portal.glow : 'none'
                }}
              >
                {/* Direct New Tab Shortcut Icon */}
                <span 
                  onClick={(e) => { e.stopPropagation(); window.open(`/?portal=${portal.id}`, '_blank'); }}
                  title={`Open ${portal.name} in a new separate tab`}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    opacity: 0.5,
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s ease',
                    color: 'var(--text-muted)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                >
                  <ExternalLink size={12} />
                </span>

                <div 
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: portal.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}
                >
                  <Icon size={18} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>
                  {portal.name}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
          💡 Tip: Click ↗ to operate Student, Faculty, and Admin portals simultaneously in separate tabs.
        </div>
      </div>

      {/* Main Login Card */}
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2.25rem' }}>
        
        {/* Role Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div 
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 1rem',
              borderRadius: '16px',
              background: portalConfig.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: portalConfig.glow
            }}
          >
            <PortalIcon size={30} />
          </div>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: portalConfig.badgeColor, color: portalConfig.badgeTextColor, fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {portalConfig.badge}
          </div>

          <h2 style={{ fontSize: '1.375rem', marginBottom: '0.25rem' }}>{portalConfig.title}</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {portalConfig.subtitle}
          </p>
        </div>

        {/* Session Expired Alert (TC-05) */}
        {sessionExpiredAlert && (
          <SecurityAlert 
            alert={{
              type: 'denied',
              statusCode: 401,
              title: 'TC-05: Session Expired',
              message: 'Your cryptographic JWT token has expired. Re-authentication is required to access protected records.'
            }}
            onDismiss={dismissSessionAlert}
          />
        )}

        {/* General / Role Mismatch Error Alert */}
        {errorAlert && (
          <div style={{ marginBottom: '1.25rem' }}>
            <SecurityAlert alert={errorAlert} onDismiss={() => setErrorAlert(null)} />
            {errorAlert.title === 'Portal Role Mismatch' && (
              <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    // Switch to the matching portal
                    if (email.includes('admin')) handleSelectPortal('admin');
                    else if (email.includes('faculty')) handleSelectPortal('faculty');
                    else handleSelectPortal('student');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Switch to Correct Portal Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dedicated Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{portalConfig.emailLabel}</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>
                <Mail size={16} />
              </div>
              <input 
                type="email" 
                className="form-control" 
                style={{ paddingLeft: '2.5rem' }} 
                placeholder={portalConfig.emailPlaceholder}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>
                <KeyRound size={16} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                style={{ paddingLeft: '2.5rem' }} 
                placeholder="••••••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quick Demo Pre-fill Helper Link */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Demo: <code style={{ color: 'var(--text-secondary)' }}>{portalConfig.defaultEmail}</code></span>
            <button
              type="button"
              onClick={() => {
                setEmail(portalConfig.defaultEmail);
                setPassword(portalConfig.defaultPassword);
                setErrorAlert(null);
              }}
              style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Fill Credentials
            </button>
          </div>

          {/* Submit Button with Role-Specific Styling */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              background: portalConfig.gradient,
              boxShadow: portalConfig.glow 
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating & Directing...' : (
              <>
                <span>{portalConfig.buttonText}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Inactive Account Testing Option (TC-09) discreet link */}
        {activePortal === 'student' && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('student3@college.local');
                setPassword('Student@12345');
                setErrorAlert(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-rose)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                opacity: 0.8
              }}
            >
              Test Inactive Student Account (TC-09)
            </button>
          </div>
        )}

        {/* Security Concept Card */}
        <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#67e8f9', fontWeight: 600, marginBottom: '0.15rem' }}>
            <Lock size={12} /> Separate Role-Based Portals
          </div>
          Authentication verifies credentials. Access to the requested dashboard is strictly bounded by the server-side role verification.
        </div>

      </div>
    </div>
  );
};

export default Login;
