import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Componente de botón de acción reutilizable con diferentes variantes y tamaños
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  className = '',
  fullWidth = false
}) => {
  // Definir las clases base según la variante
  const variantClasses = {
    primary: 'bg-[#6cda84] text-white hover:bg-[#38cd58]',
    secondary: 'bg-[#f8ffe5] text-[#3d7b6f] hover:bg-[#e1ffa9]',
    outline: 'border border-[#3d7b6f] text-[#3d7b6f] hover:bg-[#f0fff0]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    text: 'text-[#3d7b6f] hover:text-[#6cda84] hover:underline'
  };

  // Definir las clases base según el tamaño
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  // Clases aplicables cuando el botón está deshabilitado o cargando
  const disabledClasses = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : '';
  
  // Clases para el ancho completo
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${disabledClasses}
        ${widthClasses}
        rounded-md transition-colors
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          <span>Cargando...</span>
        </div>
      ) : children}
    </button>
  );
};

export default ActionButton; 