import React from 'react';
import { LogOut } from 'lucide-react';
import LogoutDialog from '@/components/generals/LogoutDialog';

interface TaskAssignment {
    itemId: string;
    userId: string;
    concept: string;
    dueDate: string;
    section: string;
    sectionId: string;
    completed?: boolean;
}

interface LogoutButtonProps {
    showLogoutDialog: boolean;
    setShowLogoutDialog: (show: boolean) => void;
    taskAssignments: TaskAssignment[];
    isDarkMode: boolean;
    storage: {
        setItem: (key: string, value: unknown) => void;
    };
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
    showLogoutDialog,
    setShowLogoutDialog,
    taskAssignments,
    isDarkMode,
    storage
}) => {
    return (
        <>
            <button
                className="logout-button"
                onClick={() => setShowLogoutDialog(true)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    zIndex: 10,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease',
                    ...(isDarkMode ? {
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        color: 'rgba(255, 255, 255, 0.7)'
                    } : {
                        background: 'rgba(253, 253, 254, 0.95)',
                        color: '#0171E2',
                        border: '2px solid #0171E2',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                    })
                }}
            >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
            </button>

            <LogoutDialog
                isOpen={showLogoutDialog}
                onClose={() => {
                    // Guardar las asignaciones de tareas antes de cerrar sesión
                    storage.setItem('taskAssignments', taskAssignments);
                    setShowLogoutDialog(false);
                }}
            />
        </>
    );
};

export default LogoutButton;
