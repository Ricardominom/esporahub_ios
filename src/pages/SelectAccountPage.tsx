import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import PageHeader from '@/components/generals/PageHeader';
import LogoutDialog from '@/components/generals/LogoutDialog';
import '../styles/overview-clean.css';

const SelectAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.body.classList.contains('dark-theme')
  );

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

  // Lista de cuentas disponibles con estado activo/inactivo
  const accounts = [
    { id: 1, name: 'Juan Pérez', position: 'Alcalde', color: 'text-blue-500', isActive: true },
    { id: 2, name: 'María García', position: 'Gobernadora', color: 'text-emerald-500', isActive: true },
    { id: 3, name: 'Carlos López', position: 'Diputado', color: 'text-purple-500', isActive: false },
    { id: 4, name: 'Ana Martínez', position: 'Senadora', color: 'text-red-500', isActive: true },
    { id: 5, name: 'Roberto Silva', position: 'Presidente Municipal', color: 'text-yellow-500', isActive: false },
    { id: 6, name: 'Laura Hernández', position: 'Diputada Local', color: 'text-teal-500', isActive: true }
  ];

  const [accountStatuses] = useState<{ [key: number]: boolean }>(() => {
    const initialStatuses: { [key: number]: boolean } = {};
    accounts.forEach(account => {
      initialStatuses[account.id] = account.isActive;
    });
    return initialStatuses;
  });

  const handleAccountSelect = (accountName: string, position: string) => {
    navigate('/client-dashboard', {
      state: {
        clientName: `${accountName} - ${position}`
      }
    });
  };

  return (
    <div className={`overview-clean ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <PageHeader
        title="Seleccionar cuenta"
        subtitle="Elige una cuenta para continuar"
        backButtonText="Configuración"
        backButtonPath="/overview"
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        showUserAvatar={true}
        userAvatarSize="md"
        showUserName={true}
      />

      {/* Main Content */}
      <main className={`clean-main ${isVisible ? 'visible' : ''}`}>
        <div className="content-container">
          {/* Accounts Grid */}
          <section className="actions-section">
            <div className="actions-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {accounts.map((account, index) => (
                <div
                  key={account.id}
                  className="icloud-account-card"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    position: 'relative',
                    background: accountStatuses[account.id]
                      ? 'linear-gradient(135deg, #4ADE80 0%, #22C55E 25%, #16A34A 50%, #15803D 75%, #166534 100%)'
                      : 'linear-gradient(135deg, #EF4444 0%, #DC2626 25%, #B91C1C 50%, #991B1B 75%, #7F1D1D 100%)',
                    boxShadow: accountStatuses[account.id]
                      ? '0 8px 32px rgba(34, 197, 94, 0.3), 0 4px 16px rgba(34, 197, 94, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)'
                      : '0 8px 32px rgba(239, 68, 68, 0.3), 0 4px 16px rgba(239, 68, 68, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => handleAccountSelect(account.name, account.position)}
                >
                  {/* Status dot - green for active, red for inactive */}
                  <div
                    className="account-status-dot"
                    style={{
                      background: accountStatuses[account.id] ? '#34C759' : '#FF3B30',
                      boxShadow: accountStatuses[account.id]
                        ? '0 0 0 1px rgba(52, 199, 89, 0.3), 0 2px 8px rgba(52, 199, 89, 0.4)'
                        : '0 0 0 1px rgba(255, 59, 48, 0.3), 0 2px 8px rgba(255, 59, 48, 0.4)'
                    }}
                  ></div>

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

export default SelectAccountPage;