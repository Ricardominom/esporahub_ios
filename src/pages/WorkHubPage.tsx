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
  }
}