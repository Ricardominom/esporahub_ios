import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Clock, AlertCircle, CheckCircle, FileText, ArrowUp, Briefcase, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import LogoutDialog from '@/components/generals/LogoutDialog';
import Logo from '@/components/generals/Logo';
import UserAvatar from '@/components/generals/UserAvatar';
import ThemeToggle from '@/components/generals/ThemeToggle';
import { storage } from '@/utils/storage';
import InputModal from '@/components/generals/InputModal';
import '../styles/overview-clean.css';

interface TaskAssignment {
  itemId: string;
  userId: string;
  concept: string;
  dueDate: string;
  section: string;
  sectionId?: string;
  completed?: boolean;
  code?: string;
}

interface ProjectItem {
  id: string;
  concept: string;
  section: string;
  sectionId: string;
  completed?: boolean;
}

interface FormDataItem {
  id: string;
  concept: string;
}

const WorkHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'tareas' | 'proyecto'>('tareas');
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([]);
  const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>(() => {
    // Intentar cargar los valores de los campos desde localStorage
    const savedValues = storage.getItem<{ [key: string]: string }>('fieldValues');
    return savedValues || {};
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    fieldName: '',
    fieldType: 'text' as 'text' | 'number' | 'select',
    initialValue: '',
    selectOptions: [] as { value: string; label: string }[],
    onSave: () => { }
  });
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

  // Función para cargar los ítems del proyecto desde localStorage
  const loadProjectItems = React.useCallback(() => {
    try {
      // Cargar los ítems seleccionados y los datos del formulario
      const selectedItems = storage.getItem<{ [key: string]: boolean }>('selectedItems') || {};
      const formData = storage.getItem<{ [key: string]: FormDataItem[] }>('formData');

      if (formData) {
        const items: ProjectItem[] = [];

        // Procesar cada sección
        Object.entries(formData).forEach(([sectionId, data]: [string, FormDataItem[]]) => {
          data.forEach((item) => {
            if (selectedItems[item.id]) {
              items.push({
                id: item.id,
                concept: item.concept,
                section: getSectionName(sectionId),
                sectionId: sectionId
              });
            }
          });
        });

        setProjectItems(items);
      }
    } catch (error) {
      console.error('Error loading project items:', error);
    }
  }, []);

  useEffect(() => {
    setIsVisible(true);

    // Función para cargar las tareas
    const loadTasks = () => {
      try {
        // Cargar las asignaciones de tareas desde localStorage 
        const savedAssignments = storage.getItem<TaskAssignment[]>('taskAssignments') || [];

        // Filtrar solo las tareas asignadas al usuario actual
        if (user) {
          const userTasks = savedAssignments.filter(task => task.userId === user.id);
          setTaskAssignments(userTasks);
        }
      } catch (error) {
        console.error('Error loading task assignments:', error);
      }
    };

    // Cargar tareas inicialmente
    loadTasks();
    loadProjectItems();

    // Configurar un intervalo para verificar periódicamente si hay nuevas tareas
    const intervalId = setInterval(loadTasks, 3000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [user, loadProjectItems]);

  // Función para obtener el nombre de la sección
  const getSectionName = (sectionId: string): string => {
    const sectionMapping: { [key: string]: string } = {
      'estrategia': 'Set Up Estrategia Digital',
      'antropologicos': 'Estudios Antropológicos',
      'otros-estudios': 'Otros Estudios',
      'acompanamiento': 'Set Up Acompañamiento Digital',
      'gerencia': 'Set Up Gerencia Digital',
      'produccion': 'Set Up Producción',
      'difusion': 'Set up Difusión'
    };

    return sectionMapping[sectionId] || sectionId;
  };

  // Función para obtener las tareas según la categoría seleccionada
  const getFilteredTasks = () => {
    if (!taskAssignments.length) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + 7 - today.getDay());

    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

    return taskAssignments.filter(task => {
      // Si la categoría es "all", mostrar todas las tareas
      if (selectedCategory === 'all') return true;

      if (!task.dueDate) return selectedCategory === 'no-date';

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      switch (selectedCategory) {
        case 'past':
          return dueDate < today;
        case 'today':
          return dueDate.getTime() === today.getTime();
        case 'this-week': {
          const thisWeekEnd = new Date(today);
          thisWeekEnd.setDate(today.getDate() + (6 - today.getDay()));
          return dueDate > today && dueDate <= thisWeekEnd;
        }
        case 'next-week':
          return dueDate >= nextWeekStart && dueDate <= nextWeekEnd;
        case 'later':
          return dueDate > nextWeekEnd;
        case 'no-date':
          return !task.dueDate;
        default:
          return true;
      }
    });
  };

  const filteredTasks = getFilteredTasks();

  // Función para obtener el conteo de tareas por categoría
  const getTaskCountForCategory = (categoryId: string) => {
    if (!taskAssignments.length) return 0;

    // Si la categoría es "all", mostrar el total de tareas
    if (categoryId === 'all') return taskAssignments.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + 7 - today.getDay());

    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

    return taskAssignments.filter(task => {
      if (!task.dueDate) return categoryId === 'no-date';

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      switch (categoryId) {
        case 'past':
          return dueDate < today;
        case 'today':
          return dueDate.getTime() === today.getTime();
        case 'this-week': {
          const thisWeekEnd = new Date(today);
          thisWeekEnd.setDate(today.getDate() + (6 - today.getDay()));
          return dueDate > today && dueDate <= thisWeekEnd;
        }
        case 'next-week':
          return dueDate >= nextWeekStart && dueDate <= nextWeekEnd;
        case 'later':
          return dueDate > nextWeekEnd;
        case 'no-date':
          return !task.dueDate;
        default:
          return true;
      }
    }).length;
  };

  const timeCategories = [
    { id: 'all', label: 'Todas', icon: <Calendar size={16} /> },
    { id: 'past', label: 'Días anteriores', icon: <Clock size={16} /> },
    { id: 'today', label: 'Hoy', icon: <Calendar size={16} /> },
    { id: 'this-week', label: 'Esta semana', icon: <Calendar size={16} /> },
    { id: 'next-week', label: 'Siguiente semana', icon: <Calendar size={16} /> },
    { id: 'later', label: 'Después', icon: <Calendar size={16} /> },
    { id: 'no-date', label: 'Sin fecha', icon: <Calendar size={16} /> }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Función para abrir el modal
  const openModal = (
    itemId: string,
    fieldName: string,
    fieldType: 'text' | 'number' | 'select' = 'text',
    selectOptions: { value: string; label: string }[] = []
  ) => {
    const fieldKey = `${itemId}-${fieldName}`;
    const currentValue = fieldValues[fieldKey] || '';

    setModalState({
      isOpen: true,
      fieldName,
      fieldType,
      initialValue: currentValue,
      selectOptions,
      onSave: () => { }
    });
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  // Función para obtener el valor de un campo
  const getFieldValue = (itemId: string, fieldName: string) => {
    const fieldKey = `${itemId}-${fieldName}`;
    return fieldValues[fieldKey] || '';
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
              <h1>WorkHub</h1>
              <p>Centro de colaboración y gestión de tareas</p>
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
          {/* Tab Navigation - Apple Style */}
          <section className="actions-section">
            <div className="section-header">
              <h2>Workhub</h2>
              <p>Gestiona tus tareas y proyectos</p>
            </div>

            {/* Tab Selector */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '2rem',
              gap: '0'
            }}>
              <button
                className={`tab-selector ${activeTab === 'tareas' ? 'active' : ''}`}
                onClick={() => setActiveTab('tareas')}
                style={{
                  padding: '12px 24px',
                  borderRadius: activeTab === 'tareas' ? '22px 0 0 22px' : '22px 0 0 22px',
                  border: 'none',
                  fontSize: '17px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '120px',
                  ...(isDarkMode ? {
                    background: activeTab === 'tareas' ? 'rgba(0, 122, 255, 0.8)' : 'rgba(118, 118, 128, 0.12)',
                    color: activeTab === 'tareas' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                    borderRight: '0.5px solid rgba(84, 84, 88, 0.65)'
                  } : {
                    background: activeTab === 'tareas' ? 'rgba(0, 122, 255, 0.8)' : 'rgba(118, 118, 128, 0.12)',
                    color: activeTab === 'tareas' ? 'white' : 'rgba(60, 60, 67, 0.8)',
                    borderRight: '0.5px solid rgba(60, 60, 67, 0.29)'
                  })
                }}
              >
                TAREAS
              </button>
              <button
                className={`tab-selector ${activeTab === 'proyecto' ? 'active' : ''}`}
                onClick={() => setActiveTab('proyecto')}
                style={{
                  padding: '12px 24px',
                  borderRadius: activeTab === 'proyecto' ? '0 22px 22px 0' : '0 22px 22px 0',
                  border: 'none',
                  fontSize: '17px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '120px',
                  ...(isDarkMode ? {
                    background: activeTab === 'proyecto' ? 'rgba(0, 122, 255, 0.8)' : 'rgba(118, 118, 128, 0.12)',
                    color: activeTab === 'proyecto' ? 'white' : 'rgba(255, 255, 255, 0.8)'
                  } : {
                    background: activeTab === 'proyecto' ? 'rgba(0, 122, 255, 0.8)' : 'rgba(118, 118, 128, 0.12)',
                    color: activeTab === 'proyecto' ? 'white' : 'rgba(60, 60, 67, 0.8)'
                  })
                }}
              >
                PROYECTO
              </button>
            </div>

            {/* Time Categories - Solo mostrar cuando el tab activo es 'tareas' */}
            {activeTab === 'tareas' && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '1rem',
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}>
                  {timeCategories.map(category => (
                    <div
                      key={category.id}
                      className="action-card"
                      style={{
                        cursor: 'pointer',
                        position: 'relative',
                        ...(selectedCategory === category.id ? {
                          background: isDarkMode
                            ? 'rgba(0, 122, 255, 0.2)'
                            : 'rgba(0, 122, 255, 0.1)',
                          borderColor: isDarkMode
                            ? 'rgba(0, 122, 255, 0.4)'
                            : 'rgba(0, 122, 255, 0.3)',
                          transform: 'translateY(-2px)',
                          boxShadow: isDarkMode
                            ? '0 8px 25px rgba(0, 122, 255, 0.3)'
                            : '0 8px 25px rgba(0, 122, 255, 0.2)'
                        } : {})
                      }}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <div className="card-header">
                        <div
                          className="card-icon"
                          style={{
                            backgroundColor: getTaskCountForCategory(category.id) === 0
                              ? (isDarkMode ? '#8E8E93' : '#8E8E93')
                              : '#007AFF'
                          }}
                        >
                          {category.icon}
                        </div>
                        {getTaskCountForCategory(category.id) > 0 && (
                          <div className="card-badge">
                            {getTaskCountForCategory(category.id)}
                          </div>
                        )}
                      </div>

                      <div className="card-content">
                        <h3>{category.label}</h3>
                        <p>{getTaskCountForCategory(category.id)} tareas</p>
                      </div>

                      {selectedCategory === category.id && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          color: '#007AFF',
                          background: 'rgba(0, 122, 255, 0.1)',
                          borderRadius: '50%',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Area */}
            {activeTab === 'tareas' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
                maxWidth: '1200px',
                margin: '0 auto'
              }}>
                {filteredTasks && filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <div
                      key={task.itemId}
                      className="action-card"
                      style={{
                        height: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        ...(task.completed ? {
                          background: isDarkMode
                            ? 'rgba(52, 199, 89, 0.15)'
                            : 'rgba(52, 199, 89, 0.1)',
                          borderColor: isDarkMode
                            ? 'rgba(52, 199, 89, 0.3)'
                            : 'rgba(52, 199, 89, 0.2)'
                        } : {})
                      }}
                    >
                      <div className="card-header">
                        <div
                          className="card-icon"
                          style={{
                            backgroundColor: task.completed ? '#34C759' : '#007AFF',
                            fontSize: '20px'
                          }}
                        >
                          {task.completed ? <CheckCircle size={24} /> : <Clock size={24} />}
                        </div>
                        {task.completed && (
                          <div className="card-badge" style={{ background: '#34C759' }}>
                            ✓
                          </div>
                        )}
                      </div>

                      <div className="card-content">
                        <h3 style={{
                          fontSize: '15px',
                          lineHeight: '1.3',
                          marginBottom: '8px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {task.concept || "Tarea sin nombre"}
                        </h3>
                        <p style={{
                          fontSize: '13px',
                          opacity: 0.8,
                          marginBottom: '8px'
                        }}>
                          {task.section}
                        </p>
                        <p style={{
                          fontSize: '13px',
                          opacity: 0.6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Calendar size={12} />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric'
                          }) : 'Sin fecha'}
                        </p>
                      </div>

                      <div className="card-footer">
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: isDarkMode ? 'rgba(0, 122, 255, 0.8)' : '#007AFF',
                          background: isDarkMode ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.1)',
                          padding: '4px 8px',
                          borderRadius: '8px'
                        }}>
                          {task.itemId || task.code}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    opacity: 0.6
                  }}>
                    <AlertCircle size={64} style={{
                      marginBottom: '1rem',
                      color: isDarkMode ? 'rgba(0, 122, 255, 0.6)' : 'rgba(0, 122, 255, 0.6)'
                    }} />
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#1a202c'
                    }}>
                      No tienes tareas asignadas
                    </h3>
                    <p style={{
                      fontSize: '1rem',
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#4a5568'
                    }}>
                      No se encontraron tareas en esta categoría
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: isDarkMode ? 'rgba(28, 28, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                padding: '2rem',
                border: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: isDarkMode
                  ? '0 4px 16px rgba(0, 0, 0, 0.15)'
                  : '0 8px 24px rgba(0, 0, 0, 0.08)',
                overflow: 'auto',
                maxHeight: '600px'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '0',
                    fontSize: '14px',
                    minWidth: '2000px'
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Updates</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Subele...</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Fase</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Línea estratégica</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Microcampaña</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Estatus</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Gerente</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Colaboradores</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Nombre del colaborador</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Perfil de colaborador</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Solicitud y entrega</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Semana en curso</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Tipo de item</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Cantidad V...</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Cantidad Pr...</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Cantidad A...</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Fecha de finalización</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Repositorio de co...</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Repositorio firma...</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Enlace de repositorio</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Desarrollo creativo</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Fecha testeo</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Estatus testeo</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Entrega al cliente</th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#1a202c',
                          borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'sticky',
                          top: 0,
                          background: isDarkMode ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)'
                        }}>Nombre del archivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectItems.length > 0 ? (
                        projectItems.map((item) => (
                          <tr key={item.id} style={{
                            borderBottom: isDarkMode ? '1px solid rgba(84, 84, 88, 0.65)' : '1px solid rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s ease'
                          }}>
                            <td style={{ padding: '12px' }}>
                              <button style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '8px',
                                color: '#007AFF',
                                transition: 'all 0.2s ease'
                              }}>
                                <FileText size={16} />
                              </button>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <button style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '8px',
                                color: '#34C759',
                                transition: 'all 0.2s ease'
                              }}>
                                <ArrowUp size={16} />
                              </button>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'fase')}
                                placeholder="Fase"
                                readOnly
                                onClick={() => openModal(item.id, 'Fase')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'linea_estrategica')}
                                placeholder="Línea estratégica"
                                readOnly
                                onClick={() => openModal(item.id, 'Línea estratégica')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'microcampana')}
                                placeholder="Microcampaña"
                                readOnly
                                onClick={() => openModal(item.id, 'Microcampaña')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'estatus')}
                                placeholder="Estatus"
                                readOnly
                                onClick={() => openModal(item.id, 'Estatus')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'gerente')}
                                placeholder="Gerente"
                                readOnly
                                onClick={() => openModal(item.id, 'Gerente')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'colaboradores')}
                                placeholder="Colaboradores"
                                readOnly
                                onClick={() => openModal(item.id, 'Colaboradores')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'nombre_colaborador')}
                                placeholder="Nombre del colaborador"
                                readOnly
                                onClick={() => openModal(item.id, 'Nombre del colaborador')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'perfil_colaborador')}
                                placeholder="Perfil de colaborador"
                                readOnly
                                onClick={() => openModal(item.id, 'Perfil de colaborador')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'solicitud_entrega')}
                                placeholder="Solicitud y entrega"
                                readOnly
                                onClick={() => openModal(item.id, 'Solicitud y entrega')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'semana_curso')}
                                placeholder="Semana en curso"
                                readOnly
                                onClick={() => openModal(item.id, 'Semana en curso')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'tipo_item')}
                                placeholder="Tipo de item"
                                readOnly
                                onClick={() => openModal(item.id, 'Tipo de item')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'cantidad_v')}
                                placeholder="Cantidad V..."
                                readOnly
                                onClick={() => openModal(item.id, 'Cantidad V...', 'number')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'cantidad_pr')}
                                placeholder="Cantidad Pr..."
                                readOnly
                                onClick={() => openModal(item.id, 'Cantidad Pr...', 'number')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'cantidad_a')}
                                placeholder="Cantidad A..."
                                readOnly
                                onClick={() => openModal(item.id, 'Cantidad A...', 'number')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="date"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'fecha_finalizacion')}
                                onChange={(e) => {
                                  const updatedValues = {
                                    ...fieldValues,
                                    [`${item.id}-fecha_finalizacion`]: e.target.value
                                  };
                                  setFieldValues(updatedValues);
                                  storage.setItem('fieldValues', updatedValues);
                                }}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'repositorio_co')}
                                placeholder="Repositorio de co..."
                                readOnly
                                onClick={() => openModal(item.id, 'Repositorio de co...')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'repositorio_firma')}
                                placeholder="Repositorio firma..."
                                readOnly
                                onClick={() => openModal(item.id, 'Repositorio firma...')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'enlace_repositorio')}
                                placeholder="Enlace de repositorio"
                                readOnly
                                onClick={() => openModal(item.id, 'Enlace de repositorio')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'desarrollo_creativo')}
                                placeholder="Desarrollo creativo"
                                readOnly
                                onClick={() => openModal(item.id, 'Desarrollo creativo')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="date"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'fecha_testeo')}
                                onChange={(e) => {
                                  const updatedValues = {
                                    ...fieldValues,
                                    [`${item.id}-fecha_testeo`]: e.target.value
                                  };
                                  setFieldValues(updatedValues);
                                  storage.setItem('fieldValues', updatedValues);
                                }}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'estatus_testeo')}
                                placeholder="Estatus testeo"
                                readOnly
                                onClick={() => openModal(item.id, 'Estatus testeo')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'entrega_cliente')}
                                placeholder="Entrega al cliente"
                                readOnly
                                onClick={() => openModal(item.id, 'Entrega al cliente')}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: isDarkMode ? '1px solid rgba(118, 118, 128, 0.24)' : '1px solid rgba(0, 0, 0, 0.1)',
                                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                                  color: isDarkMode ? 'white' : '#1a202c',
                                  fontSize: '14px',
                                  outline: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                value={getFieldValue(item.id, 'nombre_archivo')}
                                placeholder="Nombre del archivo"
                                readOnly
                                onClick={() => openModal(item.id, 'Nombre del archivo')}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={25} style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            opacity: 0.6
                          }}>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '1rem'
                            }}>
                              <Briefcase size={64} style={{
                                color: isDarkMode ? 'rgba(0, 122, 255, 0.6)' : 'rgba(0, 122, 255, 0.6)'
                              }} />
                              <div className="empty-project-content">
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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

      <InputModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={modalState.onSave}
        initialValue={modalState.initialValue}
        fieldName={modalState.fieldName}
        fieldType={modalState.fieldType}
        selectOptions={modalState.selectOptions}
      />

      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      />
    </div>
  );
};

export default WorkHubPage;