import React from 'react';
import { Grupo } from '../../services/gruposService';

interface Props {
  grupos: Grupo[];
  onEdit: (grupo: Grupo) => void;
  onDelete: (grupo: Grupo) => void;
  onSelect: (grupo: Grupo) => void;
}

const GruposList: React.FC<Props> = ({ grupos, onEdit, onDelete, onSelect }) => {
  if (grupos.length === 0) {
    return <p className="text-gray-500">No hay grupos disponibles.</p>;
  }

  return (
    <ul className="space-y-4">
      {grupos.map(grupo => (
        <li key={grupo.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="p-4">
            <h3 className="text-xl font-medium text-[#3d7b6f] mb-2">{grupo.nombre}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{grupo.descripcion}</p>
            
            <div className="flex gap-2">
              <button 
                onClick={() => onSelect(grupo)}
                className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#5aa86d]"
              >
                Ver detalles
              </button>
              <button 
                onClick={() => onEdit(grupo)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Editar
              </button>
              <button 
                onClick={() => onDelete(grupo)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GruposList; 