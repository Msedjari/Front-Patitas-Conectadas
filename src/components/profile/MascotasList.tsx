import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMascotasByUsuario, crearMascota, actualizarMascota, eliminarMascota, Mascota } from '../../services/mascotaService';
import ConfirmDialog from '../common/ConfirmDialog';
import SuccessMessage from '../common/SuccessMessage';

/**
 * Componente para mostrar y gestionar las mascotas del usuario
 */
const MascotasList: React.FC = () => {
  const { user } = useAuth();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMascota, setEditingMascota] = useState<Mascota | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [mascotaToDelete, setMascotaToDelete] = useState<Mascota | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    genero: 'Macho', // Por defecto
    raza: ''
  });
  
  // Cargar mascotas al montar el componente
  useEffect(() => {
    const fetchMascotas = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const mascotasData = await getMascotasByUsuario(parseInt(user.id));
        setMascotas(mascotasData);
        setError(null);
      } catch (err) {
        console.error('Error al cargar mascotas:', err);
        setError('No se pudieron cargar las mascotas. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMascotas();
  }, [user]);
  
  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Limpiar el formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      genero: 'Macho',
      raza: ''
    });
    setEditingMascota(null);
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      if (editingMascota) {
        // Actualizar mascota existente
        const updated = await actualizarMascota(
          parseInt(user.id),
          editingMascota.id!,
          formData
        );
        
        // Actualizar el estado con la mascota actualizada
        setMascotas(mascotas.map(m => 
          m.id === editingMascota.id ? updated : m
        ));
      } else {
        // Crear nueva mascota
        const newMascota = await crearMascota(parseInt(user.id), formData);
        
        // Agregar la nueva mascota al estado
        setMascotas([...mascotas, newMascota]);
      }
      
      // Resetear formulario y ocultarlo
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Error al guardar mascota:', err);
      setError('No se pudo guardar la mascota. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Preparar edición de mascota
  const handleEdit = (mascota: Mascota) => {
    setEditingMascota(mascota);
    setFormData({
      nombre: mascota.nombre,
      genero: mascota.genero,
      raza: mascota.raza
    });
    setShowForm(true);
  };
  
  // Eliminar mascota
  const handleDelete = async (mascota: Mascota) => {
    if (!user?.id || !mascota.id) return;
    
    setMascotaToDelete(mascota);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!user?.id || !mascotaToDelete?.id) return;
    
    try {
      setLoading(true);
      await eliminarMascota(parseInt(user.id), mascotaToDelete.id);
      
      // Eliminar del estado
      setMascotas(mascotas.filter(m => m.id !== mascotaToDelete.id));
      setError(null);
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`${mascotaToDelete.nombre} ha sido eliminado exitosamente.`);
    } catch (err) {
      console.error('Error al eliminar mascota:', err);
      setError('No se pudo eliminar la mascota. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
      setMascotaToDelete(null);
    }
  };
  
  if (loading && mascotas.length === 0) {
    return (
      <div className="flex justify-center my-5">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6cda84]"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#3d7b6f] text-xl font-semibold">Mis Mascotas</h2>
        <button 
          className="bg-[#6cda84] text-white px-4 py-2 rounded-md hover:bg-[#38cd58]"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancelar' : 'Agregar Mascota'}
        </button>
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {/* Formulario para agregar/editar mascota */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#f8ffe5] p-4 rounded-lg mb-6 border border-[#9fe0b7]">
          <h3 className="text-[#3d7b6f] font-medium mb-3">
            {editingMascota ? `Editar a ${editingMascota.nombre}` : 'Agregar Mascota'}
          </h3>
          
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-[#2a2827] mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
              placeholder="Nombre de tu mascota"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="genero" className="block text-sm font-medium text-[#2a2827] mb-1">
              Género
            </label>
            <select
              id="genero"
              name="genero"
              value={formData.genero}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
            >
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="raza" className="block text-sm font-medium text-[#2a2827] mb-1">
              Raza
            </label>
            <input
              type="text"
              id="raza"
              name="raza"
              value={formData.raza}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
              placeholder="Raza de tu mascota"
            />
          </div>
          
          <div className="flex justify-end">
            <button 
              type="button" 
              className="mr-2 px-4 py-2 text-[#3d7b6f] border border-[#3d7b6f] rounded-md hover:bg-[#f0fff0]"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58]"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (editingMascota ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      )}
      
      {/* Lista de mascotas */}
      {mascotas.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tienes mascotas registradas.</p>
          {!showForm && (
            <button 
              className="mt-2 text-[#3d7b6f] underline"
              onClick={() => setShowForm(true)}
            >
              Agrega tu primera mascota
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mascotas.map(mascota => (
            <div 
              key={mascota.id} 
              className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-[#3d7b6f]">{mascota.nombre}</h3>
                    <p className="text-[#575350] text-sm">{mascota.raza}</p>
                    <p className="text-[#575350] text-sm">{mascota.genero}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      className="text-[#2e82dc] hover:text-[#1f68b5]"
                      onClick={() => handleEdit(mascota)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(mascota)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Eliminar mascota"
        message={`¿Estás seguro de que deseas eliminar a ${mascotaToDelete?.nombre}? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowConfirmDialog(false);
          setMascotaToDelete(null);
        }}
        confirmText="Eliminar"
      />

      {/* Mensaje de éxito */}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
};

export default MascotasList; 