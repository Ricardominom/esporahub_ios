import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, UserX, Settings } from 'lucide-react';
import PageHeader from '@/components/generals/PageHeader';
import PageFooter from '@/components/generals/PageFooter';
import '../styles/overview-clean.css';

const OverviewMainPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.body.classList.contains('dark-theme')
  );

  const overviewItems = [
    {
      id: 'active-accounts',
      label: 'Cuentas activas',
      icon: <UserCheck size={24} />,
      color: '#34C759',
      path: '/active-accounts',
      description: 'Gestionar cuentas activas del sistema',
      count: 4,
      status: 'success'
    },
    {
      id: 'inactive-accounts',
      label: 'Cuentas inactivas',
      icon: <UserX size={24} />,
      color: '#FF3B30',
      path: '/inactive-accounts',
      description: 'Revisar y reactivar cuentas',
      count: 2,
      status: 'warning'
    },
    {
      id: 'account-config',
      label: 'Configuración de cuentas',
      icon: <Settings size={24} />,
      color: '#007AFF',
      path: '/overview',
      description: 'Crear y configurar nuevas cuentas',
      count: 0,
      status: 'info'
    }
  ];

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

  const handleThemeToggle = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    }
  };

  const handleItemClick = (item: typeof overviewItems[0]) => {
    navigate(item.path);
  };

  return (
    <div className={`overview-clean ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <PageHeader
        title="Overview de cuentas"
        subtitle="Gestión centralizada de todas las cuentas"
        backButtonText="Menú"
        backButtonPath="/dashboard"
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        showUserAvatar={true}
        userAvatarSize="md"
        showUserName={true}
      />

      {/* Main Content */}
      <main className={`clean-main ${isVisible ? 'visible' : ''}`}>
        <div className="content-container">

          {/* Action Cards */}
          <section className="actions-section">
            <div className="section-header">
              <h2>Acciones disponibles</h2>
              <p>Selecciona una opción para continuar</p>
            </div>

            <div className="actions-grid">
              {overviewItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`action-card ${item.status}`}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="card-header card-header-overview">
                    <div className="card-icon card-icon-overview" style={{ backgroundColor: item.color }}>
                      {item.icon}
                    </div>
                    {item.count > 0 && (
                      <span className="card-badge notification-badge notification-badge-outer">{item.count}</span>
                    )}
                  </div>

                  <div className="card-content card-content-overview">
                    <h3 className="card-title-overview">{item.label}</h3>
                    <p className="card-desc-overview">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <PageFooter
        showLogoutDialog={showLogoutDialog}
        onLogoutClick={() => setShowLogoutDialog(true)}
        onLogoutDialogClose={() => setShowLogoutDialog(false)}
      />
    </div>
  );
};

export default OverviewMainPage;