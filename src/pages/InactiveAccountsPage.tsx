import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Logo from '../components/generals/Logo';
import UserAvatar from '../components/generals/UserAvatar';
import ThemeToggle from '../components/generals/ThemeToggle';
import LogoutDialog from '../components/generals/LogoutDialog';
import '../styles/overview-clean.css';

const InactiveAccountsPage: React.FC = () => {
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

  // Solo cuentas inactivas
  const inactiveAccounts = [
    { id: 3, name: 'Carlos López', position: 'Diputado', color: 'text-purple-500' },
    { id: 5, name: 'Roberto Silva', position: 'Presidente Municipal', color: 'text-yellow-500' }
  ];

  const [accountStatuses, setAccountStatuses] = useState<{[key: number]: boolean}>(() => {
    const initialStatuses: {[key: number]: boolean} = {};
    inactiveAccounts.forEach(account => {
      initialStatuses[account.id] = false; // Todas empiezan como inactivas
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
              <h1>Cuentas Inactivas</h1>
              <p>Gestión de cuentas inactivas del sistema</p>
            </div>
          </div>
          
          <div className="header-right">
            <UserAvatar showName size="md" />
            <ThemeToggle 
              isDarkMode={isDarkMode} 
              onToggle={handleThemeToggle} 
            />
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
              {inactiveAccounts.map((account, index) => (
                <div 
                  key={account.id} 
                  className="icloud-account-card"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    position: 'relative',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 25%, #B91C1C 50%, #991B1B 75%, #7F1D1D 100%)',
                    boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3), 0 4px 16px rgba(239, 68, 68, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)'
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

      {/* Mensaje si no hay cuentas inactivas */}
      {inactiveAccounts.filter(account => !accountStatuses[account.id]).length === 0 && (
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
            color: isDarkMode ? 'rgba(239, 68, 68, 0.6)' : 'rgba(239, 68, 68, 0.6)'
          }} />
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#1a202c'
          }}>
            No hay cuentas inactivas
          </h3>
          <p style={{
            fontSize: '1rem',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#4a5568'
          }}>
            Todas las cuentas han sido activadas
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

export default InactiveAccountsPage;