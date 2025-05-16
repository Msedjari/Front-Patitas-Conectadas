import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Mascota, 
  createMascota, 
  updateMascota, 
  fetchMascotaById 
} from '../services/mascotasService';
import ActionButton from '../components/common/ActionButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { config } from '../config';

/**
 * Componente para crear o editar una mascota
 */
const MascotaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [mascota, setMascota] = useState<Mascota>({
    nombre: '',
    especie: '',
    raza: '',
    edad: undefined,
    genero: '',
    descripcion: '',
    foto: '',
    usuario_id: user?.id || 0
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Cargar datos de la mascota si estamos editando
  useEffect(() => {
    const loadMascota = async () => {
      if (isEditing && user) {
        try {
          setLoading(true);
          setError(null);
          
          const mascotaData = await fetchMascotaById(parseInt(id), user.id);
          setMascota(mascotaData);
        } catch (err) {
          console.error('Error al cargar la mascota:', err);
          setError('No se pudo cargar la información de la mascota. Intenta de nuevo más tarde.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadMascota();
  }, [id, isEditing, user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convertir edad a número si es necesario
    if (name === 'edad') {
      setMascota(prev => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined
      }));
    } else {
      setMascota(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Debes iniciar sesión para realizar esta acción');
      return;
    }
    
    // Validar campos requeridos
    if (!mascota.nombre || !mascota.especie) {
      setError('El nombre y la especie son campos obligatorios');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Asegurarse de que el usuario_id esté establecido
      const mascotaData = {
        ...mascota,
        usuario_id: user.id
      };
      
      if (isEditing) {
        // Actualizar mascota existente
        await updateMascota(parseInt(id), mascotaData);
        setSuccess('Mascota actualizada correctamente');
      } else {
        // Crear nueva mascota
        await createMascota(mascotaData);
        setSuccess('Mascota creada correctamente');
        
        // Limpiar el formulario después de crear
        setMascota({
          nombre: '',
          especie: '',
          raza: '',
          edad: undefined,
          genero: '',
          descripcion: '',
          foto: '',
          usuario_id: user.id
        });
      }
      
      // Redireccionar al perfil después de un breve momento
      setTimeout(() => {
        navigate(`/perfil`);
      }, 1500);
    } catch (err) {
      console.error('Error al guardar la mascota:', err);
      setError('No se pudo guardar la mascota. Intenta de nuevo más tarde.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-[#3d7b6f] mb-6">
            {isEditing ? 'Editar mascota' : 'Registrar nueva mascota'}
          </h1>
          
          {error && (
            <ErrorMessage
              message={error}
              onClose={() => setError(null)}
              className="mb-4"
            />
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre*
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={mascota.nombre}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  placeholder="Nombre de tu mascota"
                  required
                />
              </div>
              
              {/* Especie */}
              <div>
                <label htmlFor="especie" className="block text-sm font-medium text-gray-700 mb-1">
                  Especie*
                </label>
                <select
                  id="especie"
                  name="especie"
                  value={mascota.especie}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  required
                >
                  <option value="">Selecciona una especie</option>
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Ave">Ave</option>
                  <option value="Reptil">Reptil</option>
                  <option value="Roedor">Roedor</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              {/* Raza */}
              <div>
                <label htmlFor="raza" className="block text-sm font-medium text-gray-700 mb-1">
                  Raza
                </label>
                <input
                  type="text"
                  id="raza"
                  name="raza"
                  value={mascota.raza || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  placeholder="Raza de tu mascota"
                />
              </div>
              
              {/* Edad */}
              <div>
                <label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-1">
                  Edad (años)
                </label>
                <input
                  type="number"
                  id="edad"
                  name="edad"
                  value={mascota.edad || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  placeholder="Edad en años"
                  min="0"
                  max="30"
                />
              </div>
              
              {/* Género */}
              <div>
                <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <select
                  id="genero"
                  name="genero"
                  value={mascota.genero || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  <option value="">Selecciona un género</option>
                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                </select>
              </div>
              
              {/* Descripción */}
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={mascota.descripcion || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  rows={4}
                  placeholder="Describe a tu mascota, su personalidad, gustos, etc."
                />
              </div>
              
              {/* URL de la foto */}
              <div>
                <label htmlFor="foto" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de la foto
                </label>
                <input
                  type="url"
                  id="foto"
                  name="foto"
                  value={mascota.foto || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  placeholder="https://ejemplo.com/foto-mascota.jpg"
                />
                {mascota.foto && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                    <img 
                      src={mascota.foto} 
                      alt="Vista previa" 
                      className="w-32 h-32 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = config.images.defaultPetImage;
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-4">
                <ActionButton
                  variant="secondary"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                >
                  Cancelar
                </ActionButton>
                <ActionButton
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                  loading={submitting}
                >
                  {isEditing ? 'Guardar cambios' : 'Registrar mascota'}
                </ActionButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MascotaForm; 