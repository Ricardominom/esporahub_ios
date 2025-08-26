import React from 'react';
import { User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  size = 'md',
  showName = false,
  className = ''
}) => {
  const { user } = useAuthStore();
  
  // Tamaños para el avatar
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };
  
  // Tamaños para el texto
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  // Obtener icono según el rol
  const getRoleIcon = () => {
    if (!user) return <User className="w-4 h-4" />;
    
    // Todos los roles usan el mismo icono de persona
    return <User className="w-4 h-4" />;
  };
  
  // Si no hay usuario, mostrar un placeholder
  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
        {showName && (
          <span className={`${textSizeClasses[size]} text-gray-500 dark:text-gray-400`}>
            Invitado
          </span>
        )}
      </div>
    );
  }
  
  // Determinar color de fondo basado en el rol
  const getBgColor = () => {
    switch (user.role) {
      case 'super_admin':
        return 'bg-blue-500';
      case 'admin':
        return 'bg-green-500';
      case 'user':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full ${getBgColor()} flex items-center justify-center text-white shadow-lg`}>
        {getRoleIcon()}
      </div>
      
      {showName && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-medium`} style={{
            color: document.body.classList.contains('dark-theme') ? '#ffffff' : '#1f2937'
          }}>
            {user.name}
          </span>
          <span className="text-xs font-medium" style={{
            color: document.body.classList.contains('dark-theme') ? 'rgba(255, 255, 255, 0.7)' : '#4b5563'
          }}>
            {user.role === 'super_admin' ? 'Super Admin' : 
             user.role === 'admin' ? 'Administrador' : 'Usuario'}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;