import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, X } from 'lucide-react';

export const SecurityAlert = ({ alert, onDismiss }) => {
  if (!alert) return null;

  const isDenied = alert.type === 'denied' || alert.statusCode === 403 || alert.statusCode === 401;
  const isSuccess = alert.type === 'success' || alert.statusCode === 200;

  const bgColor = isDenied ? 'rgba(244, 63, 94, 0.12)' : (isSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)');
  const borderColor = isDenied ? 'var(--border-danger)' : (isSuccess ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-focus)');
  const iconColor = isDenied ? '#f43f5e' : (isSuccess ? '#10b981' : '#818cf8');

  return (
    <div 
      className="animate-fade-in"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: isDenied ? 'var(--shadow-danger-glow)' : 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', gap: '0.875rem' }}>
        <div style={{ color: iconColor, marginTop: '2px' }}>
          {isDenied ? <ShieldAlert size={22} /> : (isSuccess ? <CheckCircle size={22} /> : <AlertTriangle size={22} />)}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: isDenied ? '#fda4af' : (isSuccess ? '#6ee7b7' : '#c7d2fe') }}>
              {alert.title || (isDenied ? 'Security Control Enforced (Access Denied)' : 'Security Verification Passed')}
            </span>
            {alert.statusCode && (
              <span className={`badge ${isDenied ? 'badge-denied' : 'badge-allowed'}`}>
                HTTP {alert.statusCode} {alert.statusCode === 403 ? 'FORBIDDEN' : (alert.statusCode === 401 ? 'UNAUTHORIZED' : 'OK')}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            {alert.message}
          </p>
          {alert.details && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
              {alert.details}
            </p>
          )}
        </div>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SecurityAlert;
