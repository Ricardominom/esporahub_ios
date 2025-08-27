import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, MessageSquare, FileText, BarChart3, Settings } from 'lucide-react';
import PageHeader from '@/components/generals/PageHeader';
import PageFooter from '@/components/generals/PageFooter';
import '../styles/overview-clean.css';

const WorkHubPage: React.FC = () => {
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

  const workHubItems = [
    {
      id: 'team-management',
      label: 'Gestión de Equipo',
      icon: <Users size={32} />,
      color: '#007AFF',
      path: '/construction',
      description: 'Administrar miembros del equipo y roles'
    },
    {
      id: 'project-calendar',
      label: 'Calendario de Proyectos',
      icon: <Calendar size={32} />,
      color: '#34C759',
      path: '/construction',
      description: 'Planificar y programar actividades'
    },
    {
      id: 'team-chat',
      label: 'Chat de Equipo',
      icon: <MessageSquare size={32} />,
      color: '#5856D6',
      path: '/construction',
      description: 'Comunicación interna del equipo'
    },
    {
      id: 'documents',
      label: 'Documentos Compartidos',
      icon: <FileText size={32} />,
      color: '#FF9500',
      path: '/construction',
      description: 'Repositorio de documentos del equipo'
    },
    {
      id: 'analytics',
      label: 'Análisis de Productividad',
      icon: <BarChart3 size={32} />,
      color: '#FF3B30',
      path: '/construction',
      description: 'Métricas y reportes de rendimiento'
    },
    {
      id: 'workspace-settings',
      label: 'Configuración del Espacio',
      icon: <Settings size={32} />,
      color: '#8E8E93',
      path: '/construction',
      description: 'Personalizar el espacio de trabajo'
    }
  ];

  const handleItemClick = (item: typeof workHubItems[0]) => {
    navigate(item.path);
  };

  return (
    <div className={`overview-clean ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <PageHeader
        title="Workhub"
        subtitle="Centro de colaboración y gestión de equipos"
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
          {/* WorkHub Tools Grid */}
          <section className="actions-section">
            <div className="section-header">
              <h2>Herramientas de colaboración</h2>
              <p>Gestiona tu equipo y proyectos de manera eficiente</p>
            </div>

            <div className="actions-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 280px)',
              gap: '2rem',
              justifyContent: 'center',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {workHubItems.map((item, index) => (
                <div
                  key={item.id}
                  className="action-card"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="card-header">
                    <div
                      className="card-icon"
                      style={{ backgroundColor: item.color }}
                    >
                      {React.cloneElement(item.icon as React.ReactElement, { size: 32 })}
                    </div>
                  </div>

                  <div className="card-content">
                    <h3>{item.label}</h3>
                    <p>{item.description}</p>
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

export default WorkHubPage;