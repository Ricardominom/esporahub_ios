import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/generals/Logo';
import ThemeToggle from '@/components/generals/ThemeToggle';

const TracklinePage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.body.classList.contains('dark-theme')
  );

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

  return (
    <div className={`trackline-page ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="trackline-header">
        <button
          onClick={() => navigate('/dashboard')}
          className="back-link"
        >
          <ArrowLeft size={16} />
          <span>Volver al menú</span>
        </button>
        <h1 className="trackline-title">
          TrackLine
        </h1>
        <div className="header-right">
          <Logo />
          <ThemeToggle
            isDarkMode={isDarkMode}
            onToggle={handleThemeToggle}
          />
        </div>
      </div>

      <div className={`trackline-content ${isVisible ? 'visible' : ''}`}>
        <div className="content-message">
          <h2>Gestión de Proyectos</h2>
          <p>Aquí podrás gestionar y hacer seguimiento de todos tus proyectos activos.</p>
          <p className="note">Para crear o seleccionar cuentas, ve a <strong>Overview de cuentas</strong> desde el menú principal.</p>
        </div>
      </div>
    </div>
  );
};

export default TracklinePage;