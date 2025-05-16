import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MascotaCard from './MascotaCard';
import ActionButton from '../common/ActionButton';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import { BsPlusLg } from 'react-icons/bs';
import { 
  fetchMascotasByUserId, 
  deleteMascota, 
  Mascota 
} from '../../services/mascotasService';

interface ProfileMascotasProps {
  userId: number;
  isOwnProfile: boolean;
}

/**
 * Componente que muestra la sección de mascotas en el perfil del usuario
 */
const ProfileMascotas: React.FC<ProfileMascotasProps> = ({ userId, isOwnProfile }) => {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadMascotas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener mascotas del usuario usando el servicio
        const data = await fetchMascotasByUserId(userId);
        setMascotas(data);
      } catch (err) {
        console.error('Error al cargar mascotas:', err);
        setError('No se pudieron cargar las mascotas. Intenta de nuevo más tarde.');
        
        // Para desarrollo, usar datos de prueba si ocurre un error
        if (import.meta.env.DEV) {
          console.log('Cargando datos de prueba para desarrollo');
          setTimeout(() => {
            setMascotas([
              {
                id: 1,
                nombre: 'Luna',
                especie: 'Perro',
                raza: 'Labrador',
                edad: 3,
                genero: 'Hembra',
                descripcion: 'Luna es muy juguetona y le encanta correr en el parque.',
                foto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                usuario_id: userId,
                fecha_registro: '2023-05-15T00:00:00.000Z'
              },
              {
                id: 2,
                nombre: 'Simba',
                especie: 'Gato',
                raza: 'Siamés',
                edad: 2,
                genero: 'Macho',
                descripcion: 'Simba es un gato muy tranquilo que adora dormir al sol.',
                foto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                usuario_id: userId,
                fecha_registro: '2023-06-20T00:00:00.000Z'
              }
            ]);
          }, 500);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadMascotas();
    }
  }, [userId]);
  
  const handleAddMascota = () => {
    navigate('/mascotas/nueva');
  };
  
  const handleEditMascota = (mascota: Mascota) => {
    navigate(`/mascotas/${mascota.id}/editar`);
  };
  
  const handleDeleteMascota = async (mascota: Mascota) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${mascota.nombre}?`)) {
      return;
    }
    
    try {
      setDeleteError(null);
      // Pasar el userId como segundo parámetro según la actualización del servicio
      await deleteMascota(mascota.id!, userId);
      
      // Actualizar la lista de mascotas después de eliminar
      setMascotas(prevMascotas => prevMascotas.filter(m => m.id !== mascota.id));
    } catch (err) {
      console.error('Error al eliminar mascota:', err);
      setDeleteError('No se pudo eliminar la mascota. Intenta de nuevo más tarde.');
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner className="my-4" />;
    }
    
    if (error) {
      return (
        <ErrorMessage
          message={error}
          onClose={() => setError(null)}
        />
      );
    }
    
    if (mascotas.length === 0) {
      return (
        <EmptyState
          message={isOwnProfile ? "Aún no tienes mascotas registradas." : "Este usuario no tiene mascotas registradas."}
          actionText={isOwnProfile ? "Registrar mascota" : undefined}
          onAction={isOwnProfile ? handleAddMascota : undefined}
        />
      );
    }
    
    // Mostrar grid de mascotas
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mascotas.map(mascota => (
          <MascotaCard
            key={mascota.id}
            mascota={mascota}
            isOwnProfile={isOwnProfile}
            onEdit={isOwnProfile ? handleEditMascota : undefined}
            onDelete={isOwnProfile ? handleDeleteMascota : undefined}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#3d7b6f]">
          Mascotas
        </h2>
        
        {isOwnProfile && (
          <ActionButton
            variant="primary"
            size="sm"
            onClick={handleAddMascota}
            icon={<BsPlusLg />}
          >
            Añadir mascota
          </ActionButton>
        )}
      </div>
      
      {deleteError && (
        <ErrorMessage
          message={deleteError}
          onClose={() => setDeleteError(null)}
          className="mb-4"
        />
      )}
      
      {renderContent()}
    </div>
  );
};

export default ProfileMascotas; 