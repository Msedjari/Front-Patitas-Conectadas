import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

/**
 * Componente para mostrar un indicador de carga animado
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'border-[#6cda84]',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };
  
  return (
    <div className={`flex justify-center ${className}`}>
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 ${color}`}></div>
    </div>
  );
};

export default LoadingSpinner; 