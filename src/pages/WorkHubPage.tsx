import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <div className={`overview-clean ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <PageHeader
        title="WorkHub"
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
          {/* Actions Section */}
          <section className="actions-section">
            <div className="section-header">
              <h2>WorkHub</h2>
              <p>Centro de colaboración para gestión de equipos y proyectos</p>
            </div>

            <div className="actions-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {/* Placeholder content for WorkHub features */}
              <div className="action-card">
                <div className="card-header">
                  <div className="card-icon" style={{ backgroundColor: '#007AFF' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                </div>
                <div className="card-content">
                  <h3>Gestión de Equipos</h3>
                  <p>Administra y coordina equipos de trabajo</p>
                </div>
              </div>

              <div className="action-card">
                <div className="card-header">
                  <div className="card-icon" style={{ backgroundColor: '#34C759' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12l2 2 4-4" />
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                      <path d="M13 12h3a2 2 0 0 1 2 2v1" />
                      <path d="M11 12H8a2 2 0 0 0-2 2v1" />
                    </svg>
                  </div>
                </div>
                <div className="card-content">
                  <h3>Proyectos Activos</h3>
                  <p>Seguimiento de proyectos en curso</p>
                </div>
              </div>

              <div className="action-card">
                <div className="card-header">
                  <div className="card-icon" style={{ backgroundColor: '#FF9500' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="card-content">
                  <h3>Comunicación</h3>
                  <p>Chat y mensajería del equipo</p>
                </div>
              </div>
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