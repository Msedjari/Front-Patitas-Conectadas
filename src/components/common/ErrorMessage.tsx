import React from 'react';

interface ErrorMessageProps {
  message: string | null;
  onClose?: () => void;
  onRetry?: () => void;
}

/**
 * Componente para mostrar mensajes de error con opciones de cerrar y reintentar
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onClose, 
  onRetry 
}) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
      <p>{message}</p>
      <div className="mt-2 flex space-x-4">
        {onRetry && (
          <button 
            className="text-sm text-[#3d7b6f] hover:underline"
            onClick={onRetry}
          >
            Intentar de nuevo
          </button>
        )}
        
        {onClose && (
          <button 
            className="text-sm text-red-700 hover:underline"
            onClick={onClose}
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage; 