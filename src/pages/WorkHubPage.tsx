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
      const selectedItems = storage.getItem<{ [key: string]: boolean }>('selectedItems') || {};
      const formData = storage.getItem<{ [key: string]: FormDataItem[] }>('formData');

      if (formData) {
        const items: ProjectItem[] = [];

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

    const loadTasks = () => {
      try {
        const savedAssignments = storage.getItem<TaskAssignment[]>('taskAssignments') || [];

        if (user) {
          const userTasks = savedAssignments.filter(task => task.userId === user.id);
          setTaskAssignments(userTasks);
        }
      } catch (error) {
        console.error('Error loading task assignments:', error);
      }
    };

    loadTasks();
    loadProjectItems();

    const intervalId = setInterval(loadTasks, 3000);

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

  return (
    <div className={`overview-clean ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Header */}
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
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem',
            gap: '1rem'
          }}>
            <button
              onClick={() => setActiveTab('tareas')}
              className={`tab-button ${activeTab === 'tareas' ? 'active' : ''}`}
            >
              <div className="tab-number">
                <Briefcase size={16} />
              </div>
              <div className="tab-info">
                <div className="tab-title">Mis Tareas</div>
                <div className="tab-subtitle">({taskAssignments.length})</div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('proyecto')}
              className={`tab-button ${activeTab === 'proyecto' ? 'active' : ''}`}
            >
              <div className="tab-number">
                <FileText size={16} />
              </div>
              <div className="tab-info">
                <div className="tab-title">Vista de Proyecto</div>
                <div className="tab-subtitle">({projectItems.length})</div>
              </div>
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'tareas' && (
            <div>
              {/* Filter Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
                maxWidth: '1200px',
                margin: '0 auto 2rem auto'
              }}>
                {timeCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      border: '1px solid',
                      background: selectedCategory === category.id
                        ? (isDarkMode ? 'rgba(0, 122, 255, 0.2)' : 'rgba(0, 122, 255, 0.1)')
                        : (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'),
                      borderColor: selectedCategory === category.id
                        ? (isDarkMode ? 'rgba(0, 122, 255, 0.4)' : 'rgba(0, 122, 255, 0.3)')
                        : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                      color: isDarkMode ? 'white' : '#1a202c'
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                      {category.icon}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {category.label}
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      opacity: 0.7,
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '8px',
                      display: 'inline-block'
                    }}>
                      {getTaskCountForCategory(category.id)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tasks List */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem',
                maxWidth: '1200px',
                margin: '0 auto'
              }}>
                {filteredTasks.map((task) => (
                  <div
                    key={task.itemId}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid',
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <button
                        onClick={() => {
                          // Toggle completion logic here
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: '50%',
                          color: task.completed ? '#22c55e' : (isDarkMode ? 'rgba(255, 255, 255, 0.6)' : '#6b7280')
                        }}
                      >
                        {task.completed ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          margin: '0 0 0.5rem 0',
                          color: isDarkMode ? 'white' : '#1a202c'
                        }}>
                          {task.concept}
                        </h3>
                        <p style={{
                          fontSize: '0.8rem',
                          margin: '0 0 0.5rem 0',
                          opacity: 0.7,
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280'
                        }}>
                          {task.section}
                        </p>
                        {task.dueDate && (
                          <p style={{
                            fontSize: '0.8rem',
                            margin: 0,
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#4b5563'
                          }}>
                            Vence: {new Date(task.dueDate).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTasks.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  opacity: 0.6
                }}>
                  <Briefcase size={64} style={{
                    marginBottom: '1rem',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
                  }} />
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#4a5568'
                  }}>
                    No hay tareas en esta categoría
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : '#6b7280'
                  }}>
                    Selecciona otra categoría o espera a que se asignen nuevas tareas
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'proyecto' && (
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                textAlign: 'center',
                color: isDarkMode ? 'white' : '#1a202c'
              }}>
                Vista General del Proyecto
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
                maxWidth: '1200px',
                margin: '0 auto'
              }}>
                {projectItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid',
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        background: isDarkMode ? 'rgba(0, 122, 255, 0.2)' : 'rgba(0, 122, 255, 0.1)',
                        color: isDarkMode ? '#0A84FF' : '#007AFF'
                      }}>
                        {item.id}
                      </span>
                    </div>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      color: isDarkMode ? 'white' : '#1a202c'
                    }}>
                      {item.concept}
                    </h3>
                    <p style={{
                      fontSize: '0.8rem',
                      margin: 0,
                      opacity: 0.7,
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280'
                    }}>
                      {item.section}
                    </p>
                  </div>
                ))}
              </div>

              {projectItems.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  opacity: 0.6
                }}>
                  <FileText size={64} style={{
                    marginBottom: '1rem',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
                  }} />
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#4a5568'
                  }}>
                    No hay elementos en el proyecto
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : '#6b7280'
                  }}>
                    Los elementos aparecerán aquí cuando se configuren en el acuerdo de colaboración
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Logout Button */}
      <button
        onClick={() => setShowLogoutDialog(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '20px',
          fontSize: '0.875rem',
          cursor: 'pointer',
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          background: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
          color: '#ef4444'
        }}
      >
        <LogOut size={16} />
        <span>Cerrar sesión</span>
      </button>

      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      />

      <InputModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onSave={modalState.onSave}
        initialValue={modalState.initialValue}
        fieldName={modalState.fieldName}
        fieldType={modalState.fieldType}
        selectOptions={modalState.selectOptions}
      />
    </div>
  );
};

export default WorkHubPage;