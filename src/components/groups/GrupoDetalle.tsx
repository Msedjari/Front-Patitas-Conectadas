import React, { useEffect, useState } from 'react';
import BotonUnirseGrupo from './BotonUnirseGrupo';
import { useAuth } from '../../context/AuthContext';
import { usuarioGrupoService, UsuarioGrupo } from '../../services/usuarioGrupoService';

interface GrupoDetalleProps {
  grupo: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onMiembrosChange?: () => void;
}

const GrupoDetalle: React.FC<GrupoDetalleProps> = ({ 
  grupo, 
  onEdit, 
  onDelete,
  onMiembrosChange 
}) => {
  const { user } = useAuth();
  const [relacion, setRelacion] = useState<UsuarioGrupo | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadRelacion = async () => {
      if (user?.id && grupo.id) {
        try {
          const relaciones = await usuarioGrupoService.getUsuarioGruposByUsuario(Number(user.id));
          const relacionGrupo = relaciones.find(r => r.grupoId === grupo.id);
          setRelacion(relacionGrupo || null);
          setIsAdmin(relacionGrupo?.rol === 'ADMINISTRADOR' || false);
        } catch (error) {
          console.error('Error al cargar relación usuario-grupo:', error);
        }
      }
    };

    loadRelacion();
  }, [user?.id, grupo.id]);

  const handleStatusChange = (isMiembro: boolean, relacion?: UsuarioGrupo) => {
    setRelacion(relacion || null);
    setIsAdmin(relacion?.rol === 'ADMINISTRADOR' || false);
    if (onMiembrosChange) {
      onMiembrosChange();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-[#3d7b6f] mb-2">{grupo.nombre}</h2>
          <p className="text-gray-600 mb-4">{grupo.descripcion}</p>
        </div>
        
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Editar grupo
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Eliminar grupo
              </button>
            </>
          )}
          
          {!isAdmin && (
            <BotonUnirseGrupo 
              grupoId={grupo.id} 
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GrupoDetalle; 