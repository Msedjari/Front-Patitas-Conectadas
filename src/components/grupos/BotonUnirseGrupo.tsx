import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuarioGrupoService, UsuarioGrupo } from '../../services/usuarioGrupoService';

interface BotonUnirseGrupoProps {
  grupoId: number;
  onStatusChange?: (isMiembro: boolean, relacion?: UsuarioGrupo) => void;
}

const BotonUnirseGrupo: React.FC<BotonUnirseGrupoProps> = ({ grupoId, onStatusChange }) => {
  const { user } = useAuth();
  const [isMiembro, setIsMiembro] = useState(false);
  const [relacion, setRelacion] = useState<UsuarioGrupo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const verificarMembresia = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const grupos = await usuarioGrupoService.getGruposByUsuario(user.id);
        const miGrupo = grupos.find(g => g.grupoId === grupoId);
        setIsMiembro(!!miGrupo);
        setRelacion(miGrupo || null);
        if (onStatusChange) onStatusChange(!!miGrupo, miGrupo);
      } catch (error) {
        console.error('Error al verificar membresía:', error);
      } finally {
        setLoading(false);
      }
    };

    verificarMembresia();
  }, [user?.id, grupoId]);

  const handleToggleMembresia = async () => {
    if (!user?.id) return;

    setActionLoading(true);
    try {
      if (isMiembro && relacion) {
        await usuarioGrupoService.abandonarGrupo(relacion.id);
        setIsMiembro(false);
        setRelacion(null);
        if (onStatusChange) onStatusChange(false);
      } else {
        const nuevaRelacion = await usuarioGrupoService.unirseAGrupo(user.id, grupoId);
        setIsMiembro(true);
        setRelacion(nuevaRelacion);
        if (onStatusChange) onStatusChange(true, nuevaRelacion);
      }
    } catch (error) {
      console.error('Error al cambiar membresía:', error);
      alert(error instanceof Error ? error.message : 'Error al procesar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <button className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md" disabled>Cargando...</button>;
  }

  return (
    <button
      onClick={handleToggleMembresia}
      disabled={actionLoading || (relacion?.rol === 'ADMINISTRADOR')}
      className={`px-4 py-2 rounded-md transition-colors ${
        relacion?.rol === 'ADMINISTRADOR'
          ? 'bg-gray-500 cursor-not-allowed text-white'
          : isMiembro 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-[#6cda84] hover:bg-[#5aa86d] text-white'
      }`}
    >
      {actionLoading 
        ? 'Procesando...' 
        : relacion?.rol === 'ADMINISTRADOR'
          ? 'Administrador'
          : (isMiembro ? 'Abandonar grupo' : 'Unirse al grupo')}
    </button>
  );
};

export default BotonUnirseGrupo; 