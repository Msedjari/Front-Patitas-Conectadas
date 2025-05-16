import React from 'react';
import { BsXCircle, BsX, BsArrowClockwise } from 'react-icons/bs';

interface ErrorMessageProps {
  message: string | null;
  onClose?: () => void;
  onRetry?: () => void;
  className?: string;
}

/**
 * Componente para mostrar mensajes de error con opciones para cerrar y reintentar
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onClose,
  onRetry,
  className = ''
}) => {
  // Si no hay mensaje, no renderizar nada
  if (!message) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <BsXCircle className="h-5 w-5 text-red-500" />
        </div>
        
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">
            {message}
          </p>
        </div>
        
        <div className="ml-auto pl-3 flex">
          {onRetry && (
            <button
              type="button"
              className="mr-2 inline-flex bg-red-50 rounded-md p-1 text-red-500 hover:bg-red-100 focus:outline-none"
              onClick={onRetry}
              aria-label="Reintentar"
              title="Reintentar"
            >
              <BsArrowClockwise className="h-5 w-5" />
            </button>
          )}
          
          {onClose && (
            <button
              type="button"
              className="inline-flex bg-red-50 rounded-md p-1 text-red-500 hover:bg-red-100 focus:outline-none"
              onClick={onClose}
              aria-label="Cerrar"
              title="Cerrar"
            >
              <BsX className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage; 