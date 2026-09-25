import React from 'react';
import { Shield, GraduationCap, Briefcase, ShieldAlert } from 'lucide-react';

export const RoleBadge = ({ role, showIcon = true }) => {
  const normRole = (role || '').toLowerCase();

  if (normRole === 'admin') {
    return (
      <span className="badge badge-admin">
        {showIcon && <ShieldAlert size={13} />}
        ADMINISTRATOR
      </span>
    );
  }

  if (normRole === 'faculty') {
    return (
      <span className="badge badge-faculty">
        {showIcon && <Briefcase size={13} />}
        FACULTY
      </span>
    );
  }

  return (
    <span className="badge badge-student">
      {showIcon && <GraduationCap size={13} />}
      STUDENT
    </span>
  );
};

export default RoleBadge;
