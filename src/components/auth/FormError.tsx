import React from 'react';

interface FormErrorProps {
  message: string | null;
}

/**
 * Componente para mostrar mensajes de error en formularios
 * Usado en los formularios de autenticación
 */
const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
      <p>{message}</p>
    </div>
  );
};

export default FormError; 