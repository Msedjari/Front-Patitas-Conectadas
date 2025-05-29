import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuarioGrupoService, UsuarioGrupo } from '../../services/usuarioGrupoService';

interface BotonUnirseGrupoProps {
  grupoId: number;
  onStatusChange?: (isMiembro: boolean, relacion?: UsuarioGrupo) => void;
}

const BotonUnirseGrupo: React.FC<BotonUnirseGrupoProps> = ({ grupoId, onStatusChange }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relacion, setRelacion] = useState<UsuarioGrupo | null>(null);

  useEffect(() => {
    if (user?.id) {
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      checkRelacion(userId);
    }
  }, [user?.id, grupoId]);

  const checkRelacion = async (userId: number) => {
    try {
      const relacion = await usuarioGrupoService.getRelacion(userId, grupoId);
      setRelacion(relacion);
      if (onStatusChange) {
        onStatusChange(true, relacion);
      }
    } catch (error) {
      setRelacion(null);
      if (onStatusChange) {
        onStatusChange(false);
      }
    }
  };

  const handleUnirse = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      const nuevaRelacion = await usuarioGrupoService.createUsuarioGrupo({
        usuarioId: userId,
        grupoId,
        rol: 'MIEMBRO'
      });
      
      setRelacion(nuevaRelacion);
      if (onStatusChange) {
        onStatusChange(true, nuevaRelacion);
      }
    } catch (err) {
      setError('Error al unirse al grupo');
      console.error('Error al unirse al grupo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAbandonar = async () => {
    if (!relacion) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await usuarioGrupoService.deleteUsuarioGrupo(relacion.id);
      setRelacion(null);
      if (onStatusChange) {
        onStatusChange(false);
      }
    } catch (err) {
      setError('Error al abandonar el grupo');
      console.error('Error al abandonar el grupo:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}
      
      {relacion ? (
        <button
          onClick={handleAbandonar}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? 'Abandonando...' : 'Abandonar grupo'}
        </button>
      ) : (
        <button
          onClick={handleUnirse}
          disabled={loading}
          className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#5aa86d] disabled:opacity-50"
        >
          {loading ? 'Uniéndose...' : 'Unirse al grupo'}
        </button>
      )}
    </div>
  );
};

export default BotonUnirseGrupo; 