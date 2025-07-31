import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Logo from '../components/Logo';
import UserAvatar from '../components/UserAvatar';
import LogoutDialog from '../components/LogoutDialog';
import '../styles/overview-clean.css';
import '../styles/overview-clean.css';

const ActiveAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.body.classList.contains('dark-theme')
  );
  const { logout } = useAuthStore();
  
  const handleThemeToggle = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    }
    setIsDarkMode(!isDarkMode);
  };

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.body.classList.contains('dark-theme'));
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Solo cuentas activas
  const activeAccounts = [
    { id: 1, name: 'Juan Pérez', position: 'Alcalde', color: 'text-blue-500' },
    { id: 2, name: 'María García', position: 'Gobernadora', color: 'text-emerald-500' },
    { id: 4, name: 'Ana Martínez', position: 'Senadora', color: 'text-red-500' },
    { id: 6, name: 'Laura Hernández', position: 'Diputada Local', color: 'text-teal-500' }
  ];

  const [accountStatuses, setAccountStatuses] = useState<{[key: number]: boolean}>(() => {
    const initialStatuses: {[key: number]: boolean} = {};
    activeAccounts.forEach(account => {
      initialStatuses[account.id] = true; // Todas empiezan como activas
    });
    return initialStatuses;
  });

  const toggleAccountStatus = (accountId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setAccountStatuses(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const handleAccountSelect = (accountName: string, position: string) => {
    navigate('/client-dashboard', { 
      state: { 
        clientName: `${accountName} - ${position}` 
      }
    });
  };

  return (
    <div className={`overview-clean ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Clean Header */}
      <header className="clean-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              onClick={() => navigate('/dashboard')}
              className="back-button"
            >
              <ArrowLeft size={20} />
              <span>Menú</span>
            </button>
          </div>
          
          <div className="header-center">
            <Logo />
            <div className="header-title">
              <h1>Cuentas Activas</h1>
              <p>Gestión de cuentas activas del sistema</p>
            </div>
          </div>
          
          <div className="header-right">
            <UserAvatar showName size="md" />
            <button 
              className="theme-toggle-btn"
              onClick={handleThemeToggle}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`clean-main ${isVisible ? 'visible' : ''}`}>
        <div className="content-container">
          {/* Accounts Grid */}
          <section className="actions-section">
            <div className="actions-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {activeAccounts.map((account, index) => (
                <div 
                  key={account.id} 
                  className="icloud-account-card"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    position: 'relative',
                    background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 25%, #16A34A 50%, #15803D 75%, #166534 100%)',
                    boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3), 0 4px 16px rgba(34, 197, 94, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => handleAccountSelect(account.name, account.position)}
                >
                  {/* User avatar circle */}
                  <div className="user-avatar-circle">
                    <div className="avatar-icon">
                      <div className="avatar-head"></div>
                      <div className="avatar-body"></div>
                    </div>
                  </div>
                  
                  {/* Account info */}
                  <div className="account-info">
                    <h3 className="account-name">{account.name}</h3>
                  </div>
                  
                  {/* Position badge */}
                  <div className="position-badge">
                    {account.position}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Mensaje si no hay cuentas activas */}
      {activeAccounts.filter(account => accountStatuses[account.id]).length === 0 && (
        <div className="empty-state" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          opacity: 0.8
        }}>
          <User size={64} style={{ 
            marginBottom: '1rem',
            color: isDarkMode ? 'rgba(0, 122, 255, 0.6)' : 'rgba(0, 122, 255, 0.6)'
          }} />
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#1a202c'
          }}>
            No hay cuentas activas
          </h3>
          <p style={{
            fontSize: '1rem',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#4a5568'
          }}>
            Todas las cuentas han sido desactivadas
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="clean-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-text">© 2025 Espora Hub</span>
          </div>
          <div className="footer-right">
            <button 
              className="logout-btn"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </footer>

      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      />
    </div>
  );
};

export default ActiveAccountsPage;