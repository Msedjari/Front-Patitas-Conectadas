import React from 'react';

interface EmptyStateProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
  description?: string;
}

/**
 * Componente para mostrar un estado vacío con mensaje y acción opcional
 */
const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  actionText,
  onAction,
  description
}) => {
  return (
    <div className="text-center py-10 bg-gray-50 rounded-lg">
      <p className="text-gray-500 mb-2">{message}</p>
      
      {description && (
        <p className="text-[#575350] mb-3 text-sm">{description}</p>
      )}
      
      {actionText && onAction && (
        <button 
          className="text-[#3d7b6f] hover:underline"
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState; 