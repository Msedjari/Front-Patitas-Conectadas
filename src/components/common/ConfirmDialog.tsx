import React from 'react';
import ActionButton from './ActionButton';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * Componente de diálogo de confirmación reutilizable
 * Se utiliza para confirmar acciones importantes como eliminación o cambios irreversibles
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger'
}) => {
  // No renderizar nada si el diálogo no está abierto
  if (!isOpen) return null;

  // Configurar variantes visuales según el tipo de diálogo
  const variantStyles = {
    danger: {
      headerBg: 'bg-red-100',
      titleColor: 'text-red-700',
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      confirmVariant: 'danger'
    },
    warning: {
      headerBg: 'bg-yellow-100',
      titleColor: 'text-yellow-700',
      icon: (
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      confirmVariant: 'primary'
    },
    info: {
      headerBg: 'bg-blue-100',
      titleColor: 'text-blue-700',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      confirmVariant: 'primary'
    }
  };

  const currentStyle = variantStyles[variant];

  return (
    // Backdrop oscuro de pantalla completa
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Overlay oscuro semi-transparente */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onCancel}></div>
      
      {/* Contenedor centrado del diálogo */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Ventana del diálogo */}
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto z-50 overflow-hidden transform transition-all">
          {/* Encabezado */}
          <div className={`${currentStyle.headerBg} px-4 py-3 flex items-center`}>
            {currentStyle.icon}
            <h3 className={`ml-2 text-lg font-medium ${currentStyle.titleColor}`}>{title}</h3>
          </div>
          
          {/* Cuerpo del diálogo */}
          <div className="p-6">
            <p className="text-gray-700">{message}</p>
            
            {/* Botones de acción */}
            <div className="mt-6 flex justify-end space-x-3">
              <ActionButton 
                variant="outline" 
                onClick={onCancel} 
                disabled={isLoading}
              >
                {cancelText}
              </ActionButton>
              
              <ActionButton 
                variant={variant === 'danger' ? 'danger' : 'primary'} 
                onClick={onConfirm} 
                isLoading={isLoading}
              >
                {confirmText}
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 