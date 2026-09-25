import React from 'react';
import { X, Check, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';

export const MatrixModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const matrix = [
    { feature: 'View Own Profile', student: true, faculty: true, admin: true, desc: 'Ownership check on user ID' },
    { feature: 'View Own Marks', student: true, faculty: false, admin: true, desc: 'Restricted to owning student or admin' },
    { feature: 'View Own Attendance', student: true, faculty: false, admin: true, desc: 'Restricted to owning student or admin' },
    { feature: 'View Peer Student Records', student: false, faculty: false, admin: true, desc: 'Strict horizontal isolation (TC-02)' },
    { feature: 'View Assigned Cohort', student: false, faculty: true, admin: true, desc: 'Academic department role privilege' },
    { feature: 'Update Student Marks', student: false, faculty: true, admin: true, desc: 'Faculty grading authority + Audited' },
    { feature: 'Update Attendance', student: false, faculty: true, admin: true, desc: 'Faculty attendance maintenance + Audited' },
    { feature: 'Manage User Accounts', student: false, faculty: false, admin: true, desc: 'Administrator vertical privilege (TC-03)' },
    { feature: 'Manage Roles & Status', student: false, faculty: false, admin: true, desc: 'Admin exclusive: activate/disable users' },
    { feature: 'View Security Audit Logs', student: false, faculty: false, admin: true, desc: 'Admin forensics & access violation logs' },
    { feature: 'System Diagnostics & KPIs', student: false, faculty: false, admin: true, desc: 'Administrator system oversight' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.5rem', borderRadius: '8px', color: '#818cf8' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Role-Permission Matrix (RBAC)</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Server-side enforced authorization rules across roles
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Operation / Resource</th>
                <th style={{ textAlign: 'center' }}>Student</th>
                <th style={{ textAlign: 'center' }}>Faculty</th>
                <th style={{ textAlign: 'center' }}>Admin</th>
                <th>Enforcement Mechanism</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.feature}</td>
                  <td style={{ textAlign: 'center' }}>
                    {row.student ? (
                      <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center' }}><Check size={18} /></span>
                    ) : (
                      <span style={{ color: '#f43f5e', display: 'inline-flex', alignItems: 'center' }}><Lock size={15} /></span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.faculty ? (
                      <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center' }}><Check size={18} /></span>
                    ) : (
                      <span style={{ color: '#f43f5e', display: 'inline-flex', alignItems: 'center' }}><Lock size={15} /></span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.admin ? (
                      <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center' }}><Check size={18} /></span>
                    ) : (
                      <span style={{ color: '#f43f5e', display: 'inline-flex', alignItems: 'center' }}><Lock size={15} /></span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#67e8f9', fontWeight: 600, marginBottom: '0.25rem' }}>
            <ShieldAlert size={16} /> Architectural Security Rule
          </div>
          Authorization decisions are validated strictly on the Node.js/Express server. React UI elements reflect role capabilities, but any tampered HTTP request triggers immediate <strong>403 FORBIDDEN</strong> rejection and permanent audit logging.
        </div>
      </div>
    </div>
  );
};

export default MatrixModal;
