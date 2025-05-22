import React from 'react';
import { Link } from 'react-router-dom';
import { Group as Grupo } from '../../services/groupService';
import BotonUnirseGrupo from './BotonUnirseGrupo';

interface GrupoCardProps {
  grupo: Grupo;
  onEdit?: (grupo: Grupo) => void;
  onDelete?: (grupo: Grupo) => void;
  formatDate: (date?: string) => string;
  isUserCreator?: boolean;
}

/**
 * Componente para mostrar la información de un grupo en formato de tarjeta
 */
const GrupoCard: React.FC<GrupoCardProps> = ({ 
  grupo, 
  onEdit, 
  onDelete, 
  formatDate,
  isUserCreator = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold text-[#3d7b6f]">{grupo.nombre}</h3>
        
        {/* Opciones para el creador del grupo */}
        {isUserCreator && (
          <div className="relative group">
            <button className="text-gray-500 hover:text-[#3d7b6f]">
              <span className="material-icons">more_horiz</span>
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
              <div className="py-1">
                {onEdit && (
                  <button 
                    onClick={() => onEdit(grupo)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Editar grupo
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={() => onDelete(grupo)}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    Eliminar grupo
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mt-1 mb-3">{grupo.num_miembros || 0} miembros · Creado el {formatDate(grupo.fecha_creacion)}</p>
      
      <p className="text-gray-700 mb-4 line-clamp-2">{grupo.descripcion}</p>
      
      <div className="flex justify-between mt-4">
        {/* Botón para unirse al grupo */}
        <BotonUnirseGrupo grupoId={grupo.id!} />
        
        {/* Enlace para ver el grupo */}
        <Link
          to={`/grupos/${grupo.id}`}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          Ver grupo
        </Link>
      </div>
    </div>
  );
};

export default GrupoCard; 