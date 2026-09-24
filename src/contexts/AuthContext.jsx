import React, { createContext, useContext, useState } from 'react';

// Roles: STUDENT, STAFF, SUPERVISOR, ADMIN, GRIEVANCE_OFFICER
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Default to ADMIN for this task so we can see the admin dashboard
  const [user, setUser] = useState({
    id: 'U1',
    name: 'Admin User',
    role: 'ADMIN', 
  });

  const hasRole = (roles) => {
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
