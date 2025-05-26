import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MascotaCard from './MascotaCard';
import ActionButton from '../common/ActionButton';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import { BsPlusLg } from 'react-icons/bs';
import { 
  fetchMascotasByUserId, 
  deleteMascota, 
  createMascota,
  updateMascota,
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
  const { user } = useAuth();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    nombre: string;
    genero: string;
    especie: string;
    foto?: File;
    fechaNacimiento: string;
  }>({
    nombre: '',
    genero: '',
    especie: '',
    fechaNacimiento: ''
  });
  const [editingMascota, setEditingMascota] = useState<Mascota | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  
  useEffect(() => {
    const loadMascotas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchMascotasByUserId(userId);
        setMascotas(data);
      } catch (err) {
        console.error('Error al cargar mascotas:', err);
        setError('No se pudieron cargar las mascotas. Intenta de nuevo más tarde.');
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
      await deleteMascota(mascota.id!, userId);
      setMascotas(prevMascotas => prevMascotas.filter(m => m.id !== mascota.id));
    } catch (err) {
      console.error('Error al eliminar mascota:', err);
      setDeleteError('No se pudo eliminar la mascota. Intenta de nuevo más tarde.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const mascotaData = new FormData();
      mascotaData.append('nombre', formData.nombre);
      mascotaData.append('genero', formData.genero);
      mascotaData.append('especie', formData.especie);
      mascotaData.append('usuarioId', user.id.toString());
      if (formData.fechaNacimiento) {
        mascotaData.append('fechaNacimiento', formData.fechaNacimiento);
      }
      if (formData.foto) {
        mascotaData.append('foto', formData.foto);
      }

      if (editingMascota) {
        await updateMascota(editingMascota.id!, mascotaData);
      } else {
        await createMascota(mascotaData);
      }

      setFormData({
        nombre: '',
        genero: '',
        especie: '',
        fechaNacimiento: ''
      });
      setEditingMascota(null);
      setShowForm(false);
      
      // Recargar las mascotas
      const data = await fetchMascotasByUserId(userId);
      setMascotas(data);
    } catch (error) {
      console.error('Error al guardar la mascota:', error);
      setError('Error al guardar la mascota');
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
            onClick={() => setShowForm(true)}
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
      
      {showForm ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género
              </label>
              <select
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Seleccionar género</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especie
              </label>
              <input
                type="text"
                value={formData.especie}
                onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData({ ...formData, foto: file });
                  }
                }}
                className="w-full p-2 border rounded"
                accept="image/*"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingMascota(null);
                setFormData({
                  nombre: '',
                  genero: '',
                  especie: '',
                  fechaNacimiento: ''
                });
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editingMascota ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default ProfileMascotas; 