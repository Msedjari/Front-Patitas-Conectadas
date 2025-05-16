import React from 'react';
import { BsInboxFill } from 'react-icons/bs';
import ActionButton from './ActionButton';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Componente para mostrar un estado vacío con mensaje y acción opcional
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-10 ${className}`}>
      <div className="text-gray-400 mb-4">
        {icon || <BsInboxFill size={40} />}
      </div>
      
      <p className="text-gray-500 text-center mb-4">
        {message}
      </p>
      
      {actionText && onAction && (
        <ActionButton
          variant="primary"
          size="sm"
          onClick={onAction}
        >
          {actionText}
        </ActionButton>
      )}
    </div>
  );
};

export default EmptyState; 