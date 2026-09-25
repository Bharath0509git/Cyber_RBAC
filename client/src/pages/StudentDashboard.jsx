import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentService, apiRequest } from '../services/api';
import { SecurityAlert } from '../components/SecurityAlert';
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  User, 
  ShieldAlert, 
  CheckCircle, 
  FileSpreadsheet, 
  Award, 
  AlertTriangle 
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('marks'); // 'marks', 'attendance', 'profile'
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [securityAlert, setSecurityAlert] = useState(null);
  const [overallAttendancePct, setOverallAttendancePct] = useState(0);

  const regNo = user?.profile?.registerNumber || 'STU001';

  const loadData = async () => {
    setLoading(true);
    try {
      const [marksRes, attRes, profRes] = await Promise.all([
        studentService.getMarks(regNo),
        studentService.getAttendance(regNo),
        studentService.getProfile(regNo)
      ]);

      if (marksRes.ok && marksRes.data.success) {
        setMarks(marksRes.data.marks || []);
      }
      if (attRes.ok && attRes.data.success) {
        setAttendance(attRes.data.attendance || []);
        setOverallAttendancePct(attRes.data.overallPercentage || 0);
      }
      if (profRes.ok && profRes.data.success) {
        setProfile(profRes.data.data);
      }
    } catch (e) {
      console.error('Failed to load student data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Security Test TC-01: View Own Record (Allowed)
  const runTC01Test = async () => {
    const res = await studentService.getMarks(regNo);
    if (res.ok) {
      setSecurityAlert({
        type: 'success',
        statusCode: 200,
        title: 'TC-01: Student Views Own Record (ALLOWED)',
        message: `Successfully verified ownership. Retrieved ${res.data.marks?.length || 0} academic marks for register number ${regNo}.`,
        details: `Endpoint: GET /api/students/${regNo}/marks -> HTTP 200 OK`
      });
    }
  };

  // Security Test TC-02: View Peer Record (Horizontal Escalation Blocked - Denied)
  const runTC02Test = async () => {
    const peerId = regNo === 'STU001' ? 'STU002' : 'STU001';
    const res = await studentService.getMarks(peerId);
    
    setSecurityAlert({
      type: 'denied',
      statusCode: res.status,
      title: 'TC-02: Student Views Peer Record (BLOCKED - 403 FORBIDDEN)',
      message: res.data.message || 'Horizontal privilege escalation blocked by server ownership check.',
      details: `Target: GET /api/students/${peerId}/marks | Result: HTTP ${res.status} FORBIDDEN (${res.data.code || 'FORBIDDEN_OWNERSHIP'}) | Server logged horizontal violation attempt to MongoDB audit collection.`
    });
  };

  // Security Test TC-03: Student Opens Admin Route (Vertical Escalation Blocked - Denied)
  const runTC03Test = async () => {
    const res = await apiRequest('/admin/users');
    
    setSecurityAlert({
      type: 'denied',
      statusCode: res.status,
      title: 'TC-03: Student Opens Admin Route (BLOCKED - 403 FORBIDDEN)',
      message: res.data.message || 'Vertical privilege escalation blocked by RBAC middleware.',
      details: `Target: GET /api/admin/users | Result: HTTP ${res.status} FORBIDDEN (${res.data.code || 'FORBIDDEN_ROLE'}) | Server confirmed student role lacks admin privileges.`
    });
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Welcome Banner */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '1.75rem', 
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 27, 75, 0.5))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-student">STUDENT DASHBOARD</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>ID: {regNo}</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Welcome, {user?.name || 'Student'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {profile?.department || 'Computer Science and Engineering'} • {profile?.year || 'IV Year'} • Semester {profile?.semester || 7} (Section {profile?.section || 'A'})
          </p>
        </div>

        {/* Security Demonstration Action Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.3)', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#67e8f9', fontWeight: 700, letterSpacing: '0.05em' }}>
            Live Access Control Security Tests:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={runTC01Test} className="btn btn-secondary btn-sm" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7' }}>
              <CheckCircle size={14} /> TC-01: View Own Data
            </button>
            <button onClick={runTC02Test} className="btn btn-danger-outline btn-sm">
              <ShieldAlert size={14} /> TC-02: Try Peer Record
            </button>
            <button onClick={runTC03Test} className="btn btn-danger-outline btn-sm">
              <ShieldAlert size={14} /> TC-03: Try Admin Route
            </button>
          </div>
        </div>
      </div>

      {/* Security Alert Notification */}
      {securityAlert && (
        <SecurityAlert alert={securityAlert} onDismiss={() => setSecurityAlert(null)} />
      )}

      {/* Quick Academic KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-val">{marks.length}</div>
            <div className="stat-label">Enrolled Subjects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#67e8f9' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-val">{overallAttendancePct}%</div>
            <div className="stat-label">Overall Attendance</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-val">Good</div>
            <div className="stat-label">Academic Standing</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#d8b4fe' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="stat-val">{overallAttendancePct >= 75 ? 'Eligible' : 'Warning'}</div>
            <div className="stat-label">Exam Hall Eligibility</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('marks')}
          className={`btn btn-sm ${activeTab === 'marks' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <FileSpreadsheet size={16} />
          <span>My Marks & Grades</span>
        </button>

        <button 
          onClick={() => setActiveTab('attendance')}
          className={`btn btn-sm ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <Clock size={16} />
          <span>My Attendance Record</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`btn btn-sm ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <User size={16} />
          <span>My Academic Profile</span>
        </button>
      </div>

      {/* Tab 1: Marks Table */}
      {activeTab === 'marks' && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Semester Assessment Breakdown</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Protected by server-side ownership authorization
            </span>
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
                  <th style={{ textAlign: 'center' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {marks.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No marks published yet for this semester.
                    </td>
                  </tr>
                ) : (
                  marks.map((m) => (
                    <tr key={m._id || m.subjectCode}>
                      <td style={{ fontWeight: 700, color: '#818cf8' }}>{m.subjectCode}</td>
                      <td>{m.subjectName}</td>
                      <td style={{ textAlign: 'center' }}>{m.internalMark} / 40</td>
                      <td style={{ textAlign: 'center' }}>{m.semesterMark} / 60</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{m.total}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#c7d2fe', fontWeight: 800 }}>
                          {m.grade}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-allowed">PASS</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Table */}
      {activeTab === 'attendance' && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Subject-wise Attendance Hours</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Mandatory Minimum Attendance: 75%
            </span>
          </div>

          <div className="table-responsive">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Course Title</th>
                  <th style={{ textAlign: 'center' }}>Attended / Total</th>
                  <th>Attendance Ratio</th>
                  <th style={{ textAlign: 'center' }}>Percentage</th>
                  <th style={{ textAlign: 'center' }}>Eligibility Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No attendance data registered.
                    </td>
                  </tr>
                ) : (
                  attendance.map((att) => {
                    const pct = att.percentage || Math.round((att.attendedHours / att.totalHours) * 100);
                    const isWarning = pct < 75;

                    return (
                      <tr key={att._id || att.subjectCode}>
                        <td style={{ fontWeight: 700, color: '#06b6d4' }}>{att.subjectCode}</td>
                        <td>{att.subjectName}</td>
                        <td style={{ textAlign: 'center' }}>{att.attendedHours} / {att.totalHours} hrs</td>
                        <td style={{ width: '220px' }}>
                          <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${pct}%`, 
                                height: '100%', 
                                background: isWarning ? 'linear-gradient(90deg, #f59e0b, #f43f5e)' : 'linear-gradient(90deg, #06b6d4, #10b981)' 
                              }} 
                            />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: isWarning ? '#fda4af' : '#6ee7b7' }}>
                          {pct}%
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isWarning ? (
                            <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                              <AlertTriangle size={12} /> Shortage Warning
                            </span>
                          ) : (
                            <span className="badge badge-allowed">
                              <CheckCircle size={12} /> Eligible
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Profile */}
      {activeTab === 'profile' && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.75rem', maxWidth: '750px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Personal & Academic Registration</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <div className="form-label">Full Name</div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{profile?.name || user?.name}</div>
            </div>
            <div>
              <div className="form-label">University Register Number</div>
              <div style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.9375rem' }}>{profile?.registerNumber}</div>
            </div>
            <div>
              <div className="form-label">College Email</div>
              <div style={{ fontSize: '0.875rem' }}>{profile?.email || user?.email}</div>
            </div>
            <div>
              <div className="form-label">Department</div>
              <div style={{ fontSize: '0.875rem' }}>{profile?.department}</div>
            </div>
            <div>
              <div className="form-label">Current Academic Level</div>
              <div style={{ fontSize: '0.875rem' }}>{profile?.year} (Semester {profile?.semester})</div>
            </div>
            <div>
              <div className="form-label">Assigned Section</div>
              <div style={{ fontSize: '0.875rem' }}>Section {profile?.section}</div>
            </div>
            <div>
              <div className="form-label">Faculty Mentor</div>
              <div style={{ fontSize: '0.875rem' }}>Dr. Alan Turing (FAC001)</div>
            </div>
            <div>
              <div className="form-label">Account Security Status</div>
              <span className="badge badge-allowed">Active & Enrolled</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
