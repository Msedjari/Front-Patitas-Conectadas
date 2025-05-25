import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchAmigos, seguirUsuario, dejarDeSeguirUsuario } from '../../services/amigosService';
import ConfirmDialog from './ConfirmDialog';

interface BotonSeguirProps {
  usuarioId: number; // ID del usuario al que se le puede seguir/dejar de seguir
  onSeguir?: () => void; // Callback opcional cuando se sigue a un usuario
  onDejarDeSeguir?: () => void; // Callback opcional cuando se deja de seguir a un usuario
  nombreUsuario?: string;
  siguiendoInicial?: boolean;
}

const BotonSeguir: React.FC<BotonSeguirProps> = ({ 
  usuarioId, 
  onSeguir, 
  onDejarDeSeguir,
  nombreUsuario = 'este usuario',
  siguiendoInicial = false
}) => {
  const { user } = useAuth();
  const [siguiendo, setSiguiendo] = useState(siguiendoInicial);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // No mostrar el botón si es mi propio perfil o no estoy logueado
  if (!user?.id || Number(user.id) === usuarioId) return null;

  useEffect(() => {
    const checkSeguimiento = async () => {
      try {
        const seguidos = await fetchAmigos(Number(user.id));
        const estaSiguiendo = seguidos.some((s: any) => s.usuarioQueEsSeguidoId === usuarioId);
        setSiguiendo(estaSiguiendo);
      } catch (error) {
        console.error('Error al verificar seguimiento:', error);
        setSiguiendo(false);
      }
    };

    checkSeguimiento();
  }, [user.id, usuarioId]);

  const handleSeguir = async () => {
    setLoading(true);
    try {
      await seguirUsuario(Number(user.id), usuarioId);
      setSiguiendo(true);
      onSeguir?.();
    } catch (error) {
      console.error('Error al seguir usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDejarDeSeguir = async () => {
    setLoading(true);
    try {
      await dejarDeSeguirUsuario(Number(user.id), usuarioId);
      setSiguiendo(false);
      onDejarDeSeguir?.();
    } catch (error) {
      console.error('Error al dejar de seguir usuario:', error);
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      {siguiendo ? (
        <button
          onClick={() => setShowConfirmDialog(true)}
          disabled={loading}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-200"
        >
          {loading ? 'Procesando...' : 'Dejar de seguir'}
        </button>
      ) : (
        <button
          onClick={handleSeguir}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
        >
          {loading ? 'Procesando...' : 'Seguir'}
        </button>
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Dejar de seguir"
        message={`¿Estás seguro de que quieres dejar de seguir a ${nombreUsuario}?`}
        onConfirm={handleDejarDeSeguir}
        onCancel={() => setShowConfirmDialog(false)}
        confirmText="Dejar de seguir"
        cancelText="Cancelar"
      />
    </>
  );
};

export default BotonSeguir; 