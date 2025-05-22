import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchRelacionUsuarioGrupo, 
  joinGroup, 
  deleteUsuarioGrupo, 
  UsuarioGrupo 
} from '../../services/groupService';

interface BotonUnirseGrupoProps {
  grupoId: number;
  onMembershipChange?: () => void;
  className?: string;
}

const BotonUnirseGrupo: React.FC<BotonUnirseGrupoProps> = ({ 
  grupoId, 
  onMembershipChange,
  className = "bg-[#3d7b6f] text-white px-4 py-2 rounded hover:bg-[#2a5a50] transition-colors"
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isMember, setIsMember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [membership, setMembership] = useState<UsuarioGrupo | null>(null);

  // Verificar si el usuario ya es miembro del grupo
  useEffect(() => {
    const checkMembership = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
        const relation = await fetchRelacionUsuarioGrupo(userId, grupoId);
        
        if (relation) {
          setIsMember(true);
          setMembership(relation);
        } else {
          setIsMember(false);
          setMembership(null);
        }
      } catch (err) {
        console.error('Error al verificar membresía:', err);
        // Si es error 404, significa que no es miembro
        if (err instanceof Error && err.message.includes('404')) {
          setIsMember(false);
        } else {
          setError('Error al verificar si perteneces al grupo');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkMembership();
  }, [grupoId, user, isAuthenticated]);

  // Manejar unirse o abandonar grupo
  const handleToggleMembership = async () => {
    if (!isAuthenticated) {
      // Redirigir a login si no está autenticado
      window.location.href = '/login';
      return;
    }
    
    if (!user?.id) {
      setError('No se pudo identificar al usuario');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      
      if (isMember && membership?.id) {
        // Abandonar el grupo
        await deleteUsuarioGrupo(membership.id);
        setIsMember(false);
        setMembership(null);
      } else {
        // Unirse al grupo
        const newMembership = await joinGroup(grupoId, userId);
        setIsMember(true);
        setMembership(newMembership);
      }
      
      // Notificar cambio si se proporciona callback
      if (onMembershipChange) {
        onMembershipChange();
      }
    } catch (err) {
      console.error('Error al cambiar membresía:', err);
      setError(isMember 
        ? 'No se pudo abandonar el grupo. Intenta de nuevo.' 
        : 'No se pudo unir al grupo. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggleMembership}
        disabled={loading}
        className={`${className} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
        ) : null}
        {isMember ? 'Abandonar grupo' : 'Unirse al grupo'}
      </button>
      
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
    </>
  );
};

export default BotonUnirseGrupo; 