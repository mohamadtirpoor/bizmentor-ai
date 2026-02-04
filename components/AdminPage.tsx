import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import AdminLoginModal from './AdminLoginModal';

interface AdminPageProps {
  darkMode?: boolean;
}

const AdminPage: React.FC<AdminPageProps> = ({ darkMode = true }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    if (adminStatus) {
      setIsAdmin(true);
      setShowLoginModal(false);
    }
  }, []);

  const handleAdminLogin = (username: string, password: string) => {
    if (username === 'mohamad' && password === 'mohamad.tir1383') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setShowLoginModal(false);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
  };

  if (!isAdmin) {
    return (
      <div className={`h-screen flex items-center justify-center ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
        {showLoginModal && (
          <AdminLoginModal
            onClose={() => window.location.href = '/'}
            onLogin={handleAdminLogin}
            darkMode={darkMode}
          />
        )}
      </div>
    );
  }

  return <AdminDashboard darkMode={darkMode} onLogout={handleAdminLogout} />;
};

export default AdminPage;
