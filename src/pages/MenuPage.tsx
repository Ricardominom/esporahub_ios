import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Search,
  Bot
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { hasPermission } from '../data/users';
import LogoutDialog from '../components/LogoutDialog';
import Logo from '../components/Logo';
import UserAvatar from '../components/UserAvatar';
import AccessDeniedModal from '../components/AccessDeniedModal';
import EsporaIA from '../components/EsporaIA';
import '../styles/menu.css';
import '../styles/espora-ia.css';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  path?: string;
  category: 'operativas' | 'organizativas' | 'recursos';
  description: string;
  status: 'active' | 'beta' | 'new' | 'coming-soon';
}

interface DragState {
  isDragging: boolean;
  draggedItem: MenuItem | null;
  dragOffset: { x: number; y: number };
  dragPosition: { x: number; y: number };
}
const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);
  const [deniedFeature, setDeniedFeature] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dockedItems, setDockedItems] = useState<MenuItem[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dragOffset: { x: 0, y: 0 },
    dragPosition: { x: 0, y: 0 }
  });
  const [isDockHighlighted, setIsDockHighlighted] = useState(false);
  const [isEsporaIAOpen, setIsEsporaIAOpen] = useState(false);
  const [draggedItemElement, setDraggedItemElement] = useState<HTMLElement | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.body.classList.contains('dark-theme')
  );
  const { user } = useAuthStore();
  
  const menuItems: MenuItem[] = useMemo(() => [
    { 
      id: 'overview',
      label: 'Overview',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
      color: '#007AFF',
      path: '/overview-main',
      category: 'operativas',
      description: 'Panel de control principal',
      status: 'active'
    },
    { 
      id: 'sales-force',
      label: 'Sales Force',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 12l4-4 4 4 6-6"/></svg>,
      color: '#007AFF',
      category: 'operativas',
      description: 'CRM y ventas',
      status: 'active'
    },
    { 
      id: 'workhub',
      label: 'WorkHub',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      color: '#007AFF',
      path: '/workhub',
      category: 'operativas',
      description: 'Centro de colaboración',
      status: 'active'
    },
    { 
      id: 'trackline',
      label: 'TrackLine',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
      color: '#007AFF',
      path: '/construction',
      category: 'operativas',
      description: 'Gestión de proyectos',
      status: 'active'
    },
    { 
      id: 'people-ops',
      label: 'People Operations',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
      color: '#007AFF',
      category: 'operativas',
      description: 'Recursos humanos',
      status: 'active'
    },
    { 
      id: 'agenda',
      label: 'Agenda Espora',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
      color: '#5856D6',
      category: 'organizativas',
      description: 'Calendario inteligente',
      status: 'active'
    },
    { 
      id: 'gestion-acuerdos',
      label: 'Gestión de Acuerdos',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>,
      color: '#5856D6',
      category: 'organizativas',
      description: 'Gestión de contratos',
      status: 'active'
    },
    { 
      id: 'moneyflow',
      label: 'MoneyFlow',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><line x1="18" y1="12" x2="18" y2="12"/></svg>,
      color: '#5856D6',
      category: 'organizativas',
      description: 'Análisis financiero',
      status: 'active'
    },
    { 
      id: 'boveda-cliente',
      label: 'Bóveda del Cliente',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><rect x="8" y="11" width="8" height="7" rx="1" ry="1"/><path d="M10 11V9a2 2 0 1 1 4 0v2"/></svg>,
      color: '#5856D6',
      category: 'organizativas',
      description: 'Archivos del cliente',
      status: 'active'
    },
    { 
      id: 'chat',
      label: 'Espora Chat',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
      color: '#5856D6',
      category: 'organizativas',
      description: 'Mensajería empresarial',
      status: 'active'
    },
    { 
      id: 'knowledge',
      label: 'Knowledge Base',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
      color: '#FF9500',
      category: 'recursos',
      description: 'Base de conocimiento',
      status: 'active'
    },
    { 
      id: 'campus',
      label: 'Espora Campus',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
      color: '#FF9500',
      category: 'recursos',
      description: 'Plataforma de aprendizaje',
      status: 'active'
    },
    { 
      id: 'boveda-espora',
      label: 'Bóveda Espora',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
      color: '#FF9500',
      category: 'recursos',
      description: 'Documentos internos',
      status: 'active'
    },
    { 
      id: 'lab',
      label: 'Espora Lab',
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6v7.5l6 6.5a1 1 0 0 1-.7 1.7H3.7a1 1 0 0 1-.7-1.7l6-6.5V3z"/><path d="M12 9v6"/></svg>,
      color: '#FF9500',
      category: 'recursos',
      description: 'Laboratorio de innovación',
      status: 'active'
    }
  ], []);

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
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Load docked items from localStorage (dock starts empty if nothing saved)
  useEffect(() => {
    const savedDockedItems = localStorage.getItem('dockedItems');
    if (savedDockedItems) {
      try {
        const parsed = JSON.parse(savedDockedItems);
        // Re-assign icons by looking up from menuItems array
        const dockedItemsWithIcons = parsed.map((savedItem: Omit<MenuItem, 'icon'>) => {
          const fullMenuItem = menuItems.find(item => item.id === savedItem.id);
          return fullMenuItem || savedItem;
        });
        setDockedItems(dockedItemsWithIcons);
      } catch (error) {
        console.error('Error loading docked items:', error);
      }
    } else {
      setDockedItems([]); // dock starts empty
    }
  }, [menuItems]);

  // Save docked items to localStorage (save even if empty)
  useEffect(() => {
    // Remove icon property before saving to avoid circular references
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const serializableDockedItems = dockedItems.map(({ icon, ...item }) => item);
    localStorage.setItem('dockedItems', JSON.stringify(serializableDockedItems));
  }, [dockedItems]);
  const handleThemeToggle = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    }
  };

  const handleMenuItemClick = (item: MenuItem) => {
    // Don't navigate if we're dragging
    if (dragState.isDragging) return;
    
    if (item.id === 'overview' && (!user || !hasPermission(user, 'create_accounts'))) {
      setDeniedFeature('Gestión de Cuentas');
      setShowAccessDeniedModal(true);
      return;
    }
    
    if (item.path) {
      navigate(item.path);
    } else {
      navigate('/construction');
    }
  };

  const handleMouseDown = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragState({
      isDragging: true,
      draggedItem: item,
      dragOffset: { x: offsetX, y: offsetY },
      dragPosition: { x: e.clientX, y: e.clientY }
    });
    
    // Create visual clone for dragging
    const clone = e.currentTarget.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.top = `${e.clientY - offsetY}px`;
    clone.style.left = `${e.clientX - offsetX}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '1000';
    clone.style.opacity = '0.8';
    clone.style.transform = 'rotate(3deg) scale(1.05)';
    clone.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
    clone.classList.add('dragged-item-overlay');
    
    document.body.appendChild(clone);
    setDraggedItemElement(clone);
    
    // Add global mouse move and mouse up listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (clone) {
        clone.style.left = `${e.clientX - offsetX}px`;
        clone.style.top = `${e.clientY - offsetY}px`;
      }
      
      setDragState(prev => ({
        ...prev,
        dragPosition: { x: e.clientX, y: e.clientY }
      }));
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      // Check if dropped on dock
      const dockElement = document.querySelector('.dock-apps');
      if (dockElement) {
        const dockRect = dockElement.getBoundingClientRect();
        const isOverDock = (
          e.clientX >= dockRect.left &&
          e.clientX <= dockRect.right &&
          e.clientY >= dockRect.top &&
          e.clientY <= dockRect.bottom
        );
        
        if (isOverDock) {
          handleDockDrop(item);
        }
      }
      
      // Cleanup
      if (clone && clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
      setDraggedItemElement(null);
      setDragState({
        isDragging: false,
        draggedItem: null,
        dragOffset: { x: 0, y: 0 },
        dragPosition: { x: 0, y: 0 }
      });
      setIsDockHighlighted(false);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDockDrop = (item: MenuItem) => {
    const isAlreadyDocked = dockedItems.some(dockedItem => dockedItem.id === item.id);
    if (!isAlreadyDocked && dockedItems.length < 8) { // Increase limit to 8
      setDockedItems(prev => [...prev, item]);
    }
  };

  const handleDockDropEvent = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDockHighlighted(false);
    // This function handles the drop event but the actual drop logic 
    // is handled by mouse events in handleMouseDown/handleMouseUp
  };

  // Mouse move handler for dock highlighting
  useEffect(() => {
    if (!dragState.isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const dockElement = document.querySelector('.dock-apps');
      if (dockElement) {
        const dockRect = dockElement.getBoundingClientRect();
        const isOverDock = (
          e.clientX >= dockRect.left &&
          e.clientX <= dockRect.right &&
          e.clientY >= dockRect.top &&
          e.clientY <= dockRect.bottom
        );
        
        // Only update if the state actually changes
        setIsDockHighlighted(prev => prev !== isOverDock ? isOverDock : prev);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [dragState.isDragging]);

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOffset: { x: 0, y: 0 },
      dragPosition: { x: 0, y: 0 }
    });
    setIsDockHighlighted(false);
    
    if (draggedItemElement && draggedItemElement.parentNode) {
      draggedItemElement.parentNode.removeChild(draggedItemElement);
    }
    setDraggedItemElement(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (draggedItemElement && draggedItemElement.parentNode) {
        draggedItemElement.parentNode.removeChild(draggedItemElement);
      }
    };
  }, [draggedItemElement]);

  // Remove item from dock (by id)
  const handleDockItemRemove = (itemId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDockedItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Drag out from dock: start dragging a docked app
  const handleDockItemMouseDown = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragState({
      isDragging: true,
      draggedItem: item,
      dragOffset: { x: offsetX, y: offsetY },
      dragPosition: { x: e.clientX, y: e.clientY }
    });

    // Visual clone for dragging
    const clone = e.currentTarget.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.top = `${e.clientY - offsetY}px`;
    clone.style.left = `${e.clientX - offsetX}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '1000';
    clone.style.opacity = '0.8';
    clone.style.transform = 'rotate(-3deg) scale(1.05)';
    clone.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
    clone.classList.add('dragged-item-overlay');
    document.body.appendChild(clone);
    setDraggedItemElement(clone);

    // Mouse move and up listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (clone) {
        clone.style.left = `${e.clientX - offsetX}px`;
        clone.style.top = `${e.clientY - offsetY}px`;
      }
      setDragState(prev => ({
        ...prev,
        dragPosition: { x: e.clientX, y: e.clientY }
      }));
    };
    const handleMouseUp = (e: MouseEvent) => {
      // If dropped outside dock, remove from dock
      const dockElement = document.querySelector('.dock-apps');
      let isOverDock = false;
      if (dockElement) {
        const dockRect = dockElement.getBoundingClientRect();
        isOverDock = (
          e.clientX >= dockRect.left &&
          e.clientX <= dockRect.right &&
          e.clientY >= dockRect.top &&
          e.clientY <= dockRect.bottom
        );
      }
      if (!isOverDock) {
        handleDockItemRemove(item.id);
      }
      // Cleanup
      if (clone && clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
      setDraggedItemElement(null);
      setDragState({
        isDragging: false,
        draggedItem: null,
        dragOffset: { x: 0, y: 0 },
        dragPosition: { x: 0, y: 0 }
      });
      setIsDockHighlighted(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDockDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDockHighlighted(true);
  };

  const handleDockDragLeave = () => {
    setIsDockHighlighted(false);
  };

  const handleDockItemClick = (item: MenuItem) => {
    handleMenuItemClick(item);
  };

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'operativas', label: 'Operativas' },
    { id: 'organizativas', label: 'Organizativas' },
    { id: 'recursos', label: 'Recursos adicionales' }
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`ipad-menu ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* iPad Status Bar */}
      <div className="ipad-status-bar">
        <div className="status-center">
          <div className="notch"></div>
        </div>
      </div>

      {/* iPad Navigation Bar */}
      <nav className="ipad-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <Logo />
            <div className="navbar-title">
              <h1>esporahub</h1>
              <span className="app-count">{filteredItems.length} aplicaciones</span>
            </div>
          </div>
          
          <div className="navbar-center">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar aplicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="navbar-right">
            <UserAvatar showName size="md" />
          </div>
        </div>
      </nav>

      {/* iPad Sidebar */}
      <div className="ipad-sidebar">
        <div className="sidebar-header">
          <h2>Categorías</h2>
        </div>
        <div className="sidebar-categories">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-label">{category.label}</span>
              <span className="category-count">
                {category.id === 'all' 
                  ? menuItems.length 
                  : menuItems.filter(item => item.category === category.id).length
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* iPad Main Content */}
      <main className="ipad-main">
        <div className={`apps-container ${isVisible ? 'visible' : ''}`}>
          <div className="apps-grid">
            {filteredItems.map((item, index) => (
              <div 
                key={item.id} 
                className={`app-item ${item.status} ${dragState.isDragging && dragState.draggedItem?.id === item.id ? 'dragging' : ''}`}
                style={{ 
                  animationDelay: `${index * 0.05}s`
                }}
                draggable={false}
                onMouseDown={(e) => handleMouseDown(e, item)}
                onDragEnd={handleDragEnd}
                onClick={() => handleMenuItemClick(item)}
              >
                <div className="app-icon-container">
                  <div 
                    className="app-icon"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </div>
                </div>
                <div className="app-info">
                  <h3 className="app-name">{item.label}</h3>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="empty-state">
              <Search size={64} className="empty-icon" />
              <h3>No se encontraron aplicaciones</h3>
              <p>Intenta con otros términos de búsqueda o cambia la categoría</p>
            </div>
          )}
        </div>
      </main>

      {/* iPad Dock */}
      <div 
        className={`ipad-dock ${isDockHighlighted ? 'drag-over' : ''}`}
        onDragOver={handleDockDragOver}
        onDragLeave={handleDockDragLeave}
        onDrop={handleDockDropEvent}
      >
        <div className="dock-content">
          <div className={`dock-apps ${isDockHighlighted ? 'drag-over' : ''}`}>
            {/* Default dock items */}
            {/* Dynamic docked items: arrastrables para sacar del dock */}
            {dockedItems.length === 0 && (
              <div className="dock-empty-message">Arrastra tus apps favoritas aquí</div>
            )}
            {dockedItems.map((item) => (
              <div
                key={item.id}
                className="dock-app"
                onClick={() => handleDockItemClick(item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDockItemRemove(item.id, e);
                }}
                onMouseDown={(e) => handleDockItemMouseDown(e, item)}
                title={`${item.label} - Arrastra para sacar del dock o click derecho para quitar`}
                style={{ cursor: 'grab' }}
              >
                <div className="dock-icon" style={{ backgroundColor: item.color }}>
                  {item.icon}
                </div>
              </div>
            ))}
            
            {dockedItems.length > 0 && <div className="dock-separator"></div>}
            <button 
              className="dock-theme-button"
              onClick={handleThemeToggle}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button 
              className="dock-logout-button"
              onClick={() => setShowLogoutDialog(true)}
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
      

      {/* Floating Espora IA Button */}
      <button 
        className="floating-espora-ia-button"
        onClick={() => setIsEsporaIAOpen(true)}
        title="Espora IA - Asistente Inteligente"
      >
        <Bot size={20} />
        <span className="espora-ia-text">Espora IA</span>
      </button>

      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      />
      
      <AccessDeniedModal
        isOpen={showAccessDeniedModal}
        onClose={() => setShowAccessDeniedModal(false)}
        featureName={deniedFeature}
      />

      <EsporaIA
        isOpen={isEsporaIAOpen}
        onClose={() => setIsEsporaIAOpen(false)}
      />
    </div>
  );
};

export default MenuPage;