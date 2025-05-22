import React from 'react';
import BotonUnirseGrupo from './BotonUnirseGrupo';

interface GrupoDetalleProps {
  grupo: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  isAdmin: boolean;
  onMiembrosChange?: () => void;
}

const GrupoDetalle: React.FC<GrupoDetalleProps> = ({ grupo, isAdmin, onMiembrosChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-[#3d7b6f] mb-2">{grupo.nombre}</h2>
          <p className="text-gray-600 mb-4">{grupo.descripcion}</p>
        </div>
        
        {!isAdmin && (
          <BotonUnirseGrupo 
            grupoId={grupo.id} 
            onStatusChange={() => {
              if (onMiembrosChange) onMiembrosChange();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default GrupoDetalle; 