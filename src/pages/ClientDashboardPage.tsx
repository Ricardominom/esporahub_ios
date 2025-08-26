import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, FileText, Handshake, Settings, Presentation, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/data/users';
import Logo from '@/components/generals/Logo';
import UserAvatar from '@/components/generals/UserAvatar';
import ThemeToggle from '@/components/generals/ThemeToggle';
import LogoutDialog from '@/components/generals/LogoutDialog';
import AccessDeniedModal from '@/components/generals/AccessDeniedModal';
import '../styles/overview-clean.css';

const ClientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [clientName, setClientName] = useState('');
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);
  const [deniedFeature, setDeniedFeature] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.body.classList.contains('dark-theme')
  );
  const { user } = useAuthStore();

  const handleThemeToggle = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    }
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
    // Get client name from location state if available
    const state = location.state as { clientName?: string };
    if (state?.clientName) {
      setClientName(state.clientName);
    }
  }, [location]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const menuItems = [
    {
      id: 'expediente',
      label: 'Expediente electrónico',
      icon: <FileText size={32} />,
      color: '#007AFF',
      path: '/expediente-electronico'
    },
    {
      id: 'acuerdo',
      label: 'Acuerdo de colaboración',
      icon: <Handshake size={32} />,
      color: '#34C759',
      path: '/construction'
    },
    {
      id: 'eho',
      label: 'EHO',
      icon: <Settings size={32} />,
      color: '#AF52DE',
      path: '/account'
    },
    {
      id: 'presentacion',
      label: 'Presentación inicial',
      icon: <Presentation size={32} />,
      color: '#FF9500',
      path: '/construction'
    }
  ];

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    // Verificar permisos según la sección
    if (item.id === 'eho' && (!user || !hasPermission(user, 'edit_checklist'))) {
      setDeniedFeature('EHO (Engagement Hands-Off)');
      setShowAccessDeniedModal(true);
      return;
    }

    // Si tiene permisos o no se requieren permisos especiales para esta sección
    switch (item.id) {
      case 'expediente':
        navigate('/expediente-electronico', { state: { clientName } });
        break;
      case 'acuerdo':
        navigate('/account', { state: { clientName } });
        break;
      case 'eho':
        navigate('/checklist-captura', { state: { clientName } });
        break;
      case 'presentacion':
        navigate('/presentacion-inicial', { state: { clientName } });
        break;
      default:
        navigate(item.path);
        break;
    }
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
              {clientName ? (
                <>
                  <h1>{clientName.split(' - ')[0]}</h1>
                  <p>{clientName.split(' - ')[1]}</p>
                </>
              ) : (
                <>
                  <h1>Dashboard del Cliente</h1>
                  <p>Gestión de servicios y documentos</p>
                </>
              )}
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
          {/* Action Cards */}
          <section className="actions-section">
            <div className="section-header">
              <h2>Servicios Disponibles</h2>
              <p>Selecciona un servicio para continuar</p>
            </div>

            <div className="actions-grid">
              {menuItems.map((item, index) => (
                <div
                  key={item.id}
                  className="action-card"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                  onClick={() => handleMenuItemClick(item)}
                >
                  <div className="card-header">
                    <div
                      className="card-icon"
                      style={{ backgroundColor: item.color }}
                    >
                      {React.cloneElement(item.icon as React.ReactElement, { size: 40 })}
                    </div>
                  </div>

                  <div className="card-content">
                    <h3>{item.label}</h3>
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

      <AccessDeniedModal
        isOpen={showAccessDeniedModal}
        onClose={() => setShowAccessDeniedModal(false)}
        featureName={deniedFeature}
      />
    </div>
  );
};

export default ClientDashboardPage;