import React, { useState } from 'react';
import ConfirmacionEliminar from './ConfirmacionEliminar';

interface PostOptionsProps {
  esCreador: boolean;
  postId: number;
  onEliminar: () => void;
  onGuardar: () => void;
  guardado: boolean;
}

const PostOptions: React.FC<PostOptionsProps> = ({ 
  esCreador, 
  postId, 
  onEliminar, 
  onGuardar, 
  guardado 
}) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const handleEliminarClick = () => {
    setMenuAbierto(false);
    setMostrarConfirmacion(true);
  };

  const confirmarEliminacion = () => {
    onEliminar();
    setMostrarConfirmacion(false);
  };

  const cancelarEliminacion = () => {
    setMostrarConfirmacion(false);
  };

  const handleGuardarClick = () => {
    onGuardar();
    setMenuAbierto(false);
  };

  return (
    <div className="relative">
      {/* Botón de tres puntos */}
      <button 
        className="p-2 rounded-full hover:bg-gray-100"
        onClick={toggleMenu}
        aria-label="Opciones de publicación"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {/* Menú desplegable */}
      {menuAbierto && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            {/* Solo mostrar guardar si NO es el creador */}
            {(!esCreador) && (
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleGuardarClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d={guardado 
                    ? "M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" 
                    : "M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"} 
                    stroke={guardado ? "#6cda84" : "currentColor"} 
                    fill={guardado ? "#6cda84" : "none"} 
                  />
                </svg>
                {guardado ? 'Guardado' : 'Guardar publicación'}
              </button>
            )}
            {/* Solo mostrar eliminar si es el creador */}
            {esCreador && (
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={handleEliminarClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Eliminar publicación
              </button>
            )}
          </div>
        </div>
      )}

      {/* Componente de confirmación para eliminar */}
      {mostrarConfirmacion && (
        <ConfirmacionEliminar 
          onConfirmar={confirmarEliminacion} 
          onCancelar={cancelarEliminacion} 
        />
      )}
    </div>
  );
};

export default PostOptions; 