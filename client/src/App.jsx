import React from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ShieldCheck, Lock, Database, FileCheck } from 'lucide-react';

export const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              border: '3px solid rgba(99, 102, 241, 0.2)', 
              borderTopColor: '#6366f1', 
              borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem'
            }} 
          />
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Initializing Cryptographic RBAC Context...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {!user ? (
          <Login />
        ) : user.role === 'student' ? (
          <StudentDashboard />
        ) : user.role === 'faculty' ? (
          <FacultyDashboard />
        ) : user.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <h2>Unrecognized Role Exception</h2>
          </div>
        )}
      </main>

      {/* Footer with Security Governance & Tech Checklist */}
      <footer 
        style={{
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(11, 15, 25, 0.95)',
          padding: '1.25rem 1.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="#6366f1" />
            <span>Secure College Portal • Role-Based Access Control System (Topic 5)</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span><Lock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />JWT Session Expiry: 15m</span>
            <span><Database size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />MongoDB Audit Collection Active</span>
            <span><FileCheck size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />OWASP ASVS Level 2 Access Control</span>
          </div>

          <div>
            Cybersecurity Engineering & Academic Information System
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
