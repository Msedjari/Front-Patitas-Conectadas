import React, { useState, useEffect } from 'react';
import { Group as Grupo } from '../../services/groupService';
import { useAuth } from '../../context/AuthContext';
import { usuarioGrupoService, UsuarioGrupo } from '../../services/usuarioGrupoService';
import BotonUnirseGrupo from './BotonUnirseGrupo';

interface Props {
  grupos: Grupo[];
  onEdit: (grupo: Grupo) => void;
  onDelete: (grupo: Grupo) => void;
  onSelect: (grupo: Grupo) => void;
  formatDate: (date?: string) => string;
  userId?: number | string;
  emptyMessage?: string;
}

const GruposList: React.FC<Props> = ({ 
  grupos, 
  onEdit, 
  onDelete, 
  onSelect,
  formatDate,
  userId,
  emptyMessage = "No hay grupos disponibles."
}) => {
  const { user } = useAuth();
  const [relaciones, setRelaciones] = useState<{[key: number]: UsuarioGrupo | null}>({});

  useEffect(() => {
    if (user?.id) {
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      loadRelaciones(userId);
    }
  }, [user?.id, grupos]);

  const loadRelaciones = async (userId: number) => {
    try {
      const relaciones = await usuarioGrupoService.getUsuarioGruposByUsuario(userId);
      const relacionesMap = relaciones.reduce((acc, rel) => {
        acc[rel.grupoId] = rel;
        return acc;
      }, {} as {[key: number]: UsuarioGrupo});
      setRelaciones(relacionesMap);
    } catch (error) {
      console.error('Error al cargar relaciones:', error);
    }
  };

  const handleStatusChange = (grupoId: number, isMiembro: boolean, relacion?: UsuarioGrupo) => {
    setRelaciones(prev => ({
      ...prev,
      [grupoId]: relacion || null
    }));
  };

  if (grupos.length === 0) {
    return <p className="text-gray-500">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-4">
      {grupos.map(grupo => {
        const relacion = relaciones[grupo.id!];
        const isAdmin = relacion?.rol === 'ADMINISTRADOR';

        return (
          <li key={grupo.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-medium text-[#3d7b6f]">{grupo.nombre}</h3>
                <div className="flex gap-2">
                  {isAdmin && (
                    <span className="text-sm text-[#3d7b6f] bg-[#e8f5e9] px-2 py-1 rounded">
                      Administrador
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{grupo.descripcion}</p>
              
              <div className="flex justify-end gap-2">
                {isAdmin ? (
                  <>
                    <button 
                      onClick={() => onEdit(grupo)}
                      className="px-4 py-2 bg-[#3d7b6f] text-white rounded-md hover:bg-[#2c5a52] transition-colors"
                      title="Editar grupo"
                    >
                      <span className="material-icons text-sm mr-1">edit</span>
                      Editar
                    </button>
                    <button 
                      onClick={() => onDelete(grupo)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Eliminar grupo"
                    >
                      <span className="material-icons text-sm mr-1">delete</span>
                      Eliminar
                    </button>
                  </>
                ) : (
                  <BotonUnirseGrupo 
                    grupoId={grupo.id!} 
                    onStatusChange={(isMiembro, relacion) => handleStatusChange(grupo.id!, isMiembro, relacion)}
                  />
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default GruposList; 