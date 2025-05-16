import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente para la página 404 (No encontrado)
 */
const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#3d7b6f] mb-4">404</h1>
        <h2 className="text-2xl font-medium text-gray-700 mb-6">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#3d7b6f] hover:bg-[#326a60]"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 