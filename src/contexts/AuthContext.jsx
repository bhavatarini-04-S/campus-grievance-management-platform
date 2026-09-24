import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Roles: STUDENT, STAFF, SUPERVISOR, ADMIN, GRIEVANCE_OFFICER
  const [user, setUser] = useState({
    id: 'STAFF-1',
    name: 'Jane Staff',
    role: 'STAFF',
  });

  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
