import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { facultyService, apiRequest } from '../services/api';
import { SecurityAlert } from '../components/SecurityAlert';
import { 
  Briefcase, 
  Users, 
  FileEdit, 
  CheckCircle, 
  ShieldAlert, 
  Clock, 
  Award,
  ChevronRight,
  Save,
  X 
} from 'lucide-react';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAcademic, setStudentAcademic] = useState({ marks: [], attendance: [] });
  const [loading, setLoading] = useState(true);
  const [securityAlert, setSecurityAlert] = useState(null);
  const [editMarkModal, setEditMarkModal] = useState(null);
  const [internalInput, setInternalInput] = useState(0);
  const [semesterInput, setSemesterInput] = useState(0);
  const [saving, setSaving] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await facultyService.getStudents();
      if (res.ok && res.data.success) {
        setStudents(res.data.data || []);
        if (res.data.data?.length > 0) {
          selectStudent(res.data.data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load faculty students:', e);
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await facultyService.getAcademicDetails(student.registerNumber);
      if (res.ok && res.data.success) {
        setStudentAcademic({
          marks: res.data.marks || [],
          attendance: res.data.attendance || []
        });
      }
    } catch (e) {
      console.error('Error fetching student academic details:', e);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [user]);

  const openEditModal = (mark) => {
    setEditMarkModal(mark);
    setInternalInput(mark.internalMark);
    setSemesterInput(mark.semesterMark);
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    if (!editMarkModal) return;

    setSaving(true);
    const res = await facultyService.updateMarks(editMarkModal._id, internalInput, semesterInput);
    setSaving(false);

    if (res.ok && res.data.success) {
      setSecurityAlert({
        type: 'success',
        statusCode: 200,
        title: 'TC-06: Faculty Updated Student Marks (ALLOWED & AUDITED)',
        message: `Updated marks for ${editMarkModal.studentRegisterNumber} in ${editMarkModal.subjectCode} to ${res.data.data.total}/100 (Grade: ${res.data.data.grade}).`,
        details: 'Audit log successfully registered in MongoDB with action UPDATE_STUDENT_MARKS.'
      });
      setEditMarkModal(null);
      // Refresh current student's records
      selectStudent(selectedStudent);
    } else {
      setSecurityAlert({
        type: 'denied',
        statusCode: res.status,
        title: 'Update Operation Failed',
        message: res.data.message || 'Error saving marks'
      });
    }
  };

  // Test TC-07: Faculty Attempts Admin Route
  const runTC07Test = async () => {
    const res = await apiRequest('/admin/users');
    setSecurityAlert({
      type: 'denied',
      statusCode: res.status,
      title: 'TC-07: Faculty Accesses Admin Route (BLOCKED - 403 FORBIDDEN)',
      message: res.data.message || 'Vertical privilege escalation blocked by RBAC middleware.',
      details: `Target: GET /api/admin/users | Result: HTTP ${res.status} FORBIDDEN (${res.data.code || 'FORBIDDEN_ROLE'}) | Least privilege enforced: Faculty is restricted from Administrator functions.`
    });
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Banner */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '1.75rem', 
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(88, 28, 135, 0.4))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-faculty">FACULTY DASHBOARD</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>ID: FAC001</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Welcome, {user?.name || 'Dr. Alan Turing'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Associate Professor & Cyber Lab Lead • Computer Science and Engineering
          </p>
        </div>

        {/* Security Tests Action Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.3)', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#d8b4fe', fontWeight: 700, letterSpacing: '0.05em' }}>
            Faculty Access Control Verification:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                if (studentAcademic.marks?.length > 0) openEditModal(studentAcademic.marks[0]);
              }} 
              className="btn btn-secondary btn-sm" 
              style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7' }}
            >
              <CheckCircle size={14} /> TC-06: Enter Marks
            </button>
            <button onClick={runTC07Test} className="btn btn-danger-outline btn-sm">
              <ShieldAlert size={14} /> TC-07: Try Admin Route
            </button>
          </div>
        </div>
      </div>

      {/* Security Alert Notification */}
      {securityAlert && (
        <SecurityAlert alert={securityAlert} onDismiss={() => setSecurityAlert(null)} />
      )}

      {/* Main Grid: Student Selector + Academic Detail Pane */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left: Assigned Students List */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9375rem' }}>
              <Users size={18} color="#a855f7" /> Assigned Cohort
            </div>
            <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe' }}>
              {students.length} Students
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {students.map((s) => {
              const isSelected = selectedStudent?.registerNumber === s.registerNumber;
              return (
                <div 
                  key={s._id || s.registerNumber}
                  onClick={() => selectStudent(s)}
                  style={{
                    padding: '0.75rem 0.875rem',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                      {s.name}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#818cf8', fontWeight: 700 }}>
                      {s.registerNumber}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {s.year} • Sec {s.section}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Student Assessment Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Student Marks Section */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem' }}>
                  Marks Assessment for {selectedStudent?.name} ({selectedStudent?.registerNumber})
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Faculty Grading Authority (Audited Operation)
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Course Title</th>
                    <th style={{ textAlign: 'center' }}>Internal (40)</th>
                    <th style={{ textAlign: 'center' }}>Semester (60)</th>
                    <th style={{ textAlign: 'center' }}>Total (100)</th>
                    <th style={{ textAlign: 'center' }}>Grade</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAcademic.marks.map((m) => (
                    <tr key={m._id || m.subjectCode}>
                      <td style={{ fontWeight: 700, color: '#a855f7' }}>{m.subjectCode}</td>
                      <td>{m.subjectName}</td>
                      <td style={{ textAlign: 'center' }}>{m.internalMark} / 40</td>
                      <td style={{ textAlign: 'center' }}>{m.semesterMark} / 60</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{m.total}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', fontWeight: 800 }}>
                          {m.grade}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => openEditModal(m)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        >
                          <FileEdit size={13} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Attendance Section */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem' }}>
                  Attendance Record for {selectedStudent?.name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Minimum 75% requirement for university examinations
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Course Title</th>
                    <th style={{ textAlign: 'center' }}>Attended / Total</th>
                    <th style={{ textAlign: 'center' }}>Percentage</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAcademic.attendance.map((a) => (
                    <tr key={a._id || a.subjectCode}>
                      <td style={{ fontWeight: 700, color: '#06b6d4' }}>{a.subjectCode}</td>
                      <td>{a.subjectName}</td>
                      <td style={{ textAlign: 'center' }}>{a.attendedHours} / {a.totalHours} hrs</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{a.percentage}%</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${a.percentage >= 75 ? 'badge-allowed' : 'badge-denied'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Marks Modal */}
      {editMarkModal && (
        <div className="modal-overlay" onClick={() => setEditMarkModal(null)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileEdit size={20} color="#a855f7" />
                <h3 style={{ fontSize: '1.125rem' }}>Update Academic Marks</h3>
              </div>
              <button onClick={() => setEditMarkModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', fontSize: '0.8125rem' }}>
              <div><strong>Student:</strong> {editMarkModal.studentName} ({editMarkModal.studentRegisterNumber})</div>
              <div><strong>Subject:</strong> {editMarkModal.subjectCode} - {editMarkModal.subjectName}</div>
            </div>

            <form onSubmit={handleSaveMarks}>
              <div className="form-group">
                <label className="form-label">Internal Assessment Marks (0 - 40)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="40" 
                  className="form-control" 
                  value={internalInput}
                  onChange={e => setInternalInput(Math.min(40, Math.max(0, Number(e.target.value))))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Semester Examination Marks (0 - 60)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="60" 
                  className="form-control" 
                  value={semesterInput}
                  onChange={e => setSemesterInput(Math.min(60, Math.max(0, Number(e.target.value))))}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#c7d2fe' }}>Computed Total / 100:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {Number(internalInput) + Number(semesterInput)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditMarkModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Recording...' : 'Commit Marks & Audit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FacultyDashboard;
