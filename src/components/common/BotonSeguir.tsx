import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchAmigos, seguirUsuario, dejarDeSeguirUsuario } from '../../services/amigosService';

interface BotonSeguirProps {
  usuarioId: number; // ID del usuario al que se le puede seguir/dejar de seguir
}

const BotonSeguir: React.FC<BotonSeguirProps> = ({ usuarioId }) => {
  const { user } = useAuth();
  const [siguiendo, setSiguiendo] = useState(false);
  const [loading, setLoading] = useState(false);

  // No mostrar el botón si es mi propio perfil o no estoy logueado
  if (!user?.id || user.id === usuarioId) return null;

  useEffect(() => {
    fetchAmigos(user.id)
      .then(seguidos => {
        setSiguiendo(seguidos.some((s: any) => s.usuarioQueEsSeguidoId === usuarioId));
      })
      .catch(() => setSiguiendo(false));
  }, [user.id, usuarioId]);

  const handleSeguir = async () => {
    setLoading(true);
    await seguirUsuario(user.id, usuarioId);
    setSiguiendo(true);
    setLoading(false);
  };

  const handleDejarDeSeguir = async () => {
    setLoading(true);
    await dejarDeSeguirUsuario(user.id, usuarioId);
    setSiguiendo(false);
    setLoading(false);
  };

  return (
    <>
      {siguiendo ? (
        <button
          onClick={handleDejarDeSeguir}
          disabled={loading}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Dejar de seguir
        </button>
      ) : (
        <button
          onClick={handleSeguir}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Seguir
        </button>
      )}
    </>
  );
};

export default BotonSeguir; 