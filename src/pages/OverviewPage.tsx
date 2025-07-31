import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserPlus, Users, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { hasPermission } from '../data/users';
import Logo from '../components/Logo';
import UserAvatar from '../components/UserAvatar';
import CreateAccountModal from '../components/CreateAccountModal';
import SelectAccountModal from '../components/SelectAccountModal';
import LogoutDialog from '../components/LogoutDialog';
import AccessDeniedModal from '../components/AccessDeniedModal';
import '../styles/overview-clean.css';

const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [shouldShowElements, setShouldShowElements] = useState(true);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [clientName, setClientName] = useState('');
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);
  const [deniedFeature, setDeniedFeature] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.body.classList.contains('dark-theme')
  );
  const { logout, user } = useAuthStore();
  
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

  useEffect(() => {
    if (isCreateModalOpen || isSelectModalOpen) {
      // Mantener elementos visibles durante la apertura del modal
      setShouldShowElements(true);
    } else {
      // Pequeño delay solo al cerrar
      const timer = setTimeout(() => setShouldShowElements(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isCreateModalOpen, isSelectModalOpen]);

  const handleCreateAccountClick = () => {
    if (user && hasPermission(user, 'create_accounts')) {
      setIsCreateModalOpen(true);
    } else {
      setDeniedFeature('Crear Cuenta');
      setShowAccessDeniedModal(true);
    }
  };

  const handleSelectAccountClick = () => {
    navigate('/select-account');
  };

  // Opciones de configuración de cuentas
  const configurationOptions = [
    {
      id: 'create-account',
      name: 'Crear Cuenta',
      position: 'Nueva cuenta',
      color: 'text-blue-500',
      isActive: true,
      action: handleCreateAccountClick
    },
    {
      id: 'select-account',
      name: 'Seleccionar Cuenta',
      position: 'Cuenta existente',
      color: 'text-emerald-500',
      isActive: true,
      action: handleSelectAccountClick
    }
  ];

  return (
    <div className={`overview-clean ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Clean Header */}
      <header className="clean-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              onClick={() => navigate('/overview-main')}
              className="back-button"
            >
              <ArrowLeft size={20} />
              <span>Overview</span>
            </button>
          </div>
          
          <div className="header-center">
            <Logo />
            <div className="header-title">
              <h1>Configuración de Cuentas</h1>
              <p>Crear y gestionar cuentas del sistema</p>
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
          {/* Configuration Options Grid */}
          <section className="actions-section">
            <div className="actions-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '2rem',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {configurationOptions.map((option, index) => (
                <div 
                  key={option.id} 
                  className="icloud-account-card"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    position: 'relative',
                    background: option.id === 'create-account' 
                      ? 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 25%, #03A9F4 50%, #0288D1 75%, #0277BD 100%)'
                      : 'linear-gradient(135deg, #374151 0%, #1F2937 25%, #111827 50%, #0F172A 75%, #020617 100%)',
                    boxShadow: option.id === 'create-account'
                      ? '0 8px 32px rgba(3, 169, 244, 0.3), 0 4px 16px rgba(3, 169, 244, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)'
                      : '0 8px 32px rgba(55, 65, 81, 0.4), 0 4px 16px rgba(31, 41, 55, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                  onClick={option.action}
                >
                  {/* User avatar circle */}
                  <div className="user-avatar-circle">
                    <div className="avatar-icon">
                      {option.id === 'create-account' ? (
                        <UserPlus size={24} color="rgba(255, 255, 255, 0.8)" />
                      ) : (
                        <Users size={24} color="rgba(255, 255, 255, 0.8)" />
                      )}
                    </div>
                  </div>
                  
                  {/* Account info */}
                  <div className="account-info">
                    <h3 className="account-name">{option.name}</h3>
                  </div>
                  
                  {/* Position badge */}
                  <div className="position-badge">
                    {option.position}
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
      
      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateAccount={setClientName}
      />
      
      <SelectAccountModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
      />
      
      <AccessDeniedModal
        isOpen={showAccessDeniedModal}
        onClose={() => setShowAccessDeniedModal(false)}
        featureName={deniedFeature}
      />
    </div>
  );
};

export default OverviewPage;