import React, { useState } from 'react';
import { UserProfile, updateUserProfile, UserProfileUpdate } from '../../services/userService';
import { BsPencil, BsCheck, BsX } from 'react-icons/bs';
import ActionButton from '../common/ActionButton';

interface ProfileDetailsProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

/**
 * Componente que muestra los detalles del perfil del usuario
 * y permite editarlos si es el perfil propio
 */
const ProfileDetails: React.FC<ProfileDetailsProps> = ({ profile, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState<UserProfileUpdate>({
    descripcion: profile.descripcion || '',
    fecha_nacimiento: profile.fecha_nacimiento || '',
    intereses: profile.intereses || [],
    ciudad: profile.ciudad || ''
  });
  const [newInterest, setNewInterest] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Formatear fecha para mostrar
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error al formatear fecha:', e);
      return dateString;
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    
    setEditData(prev => ({
      ...prev,
      intereses: [...(prev.intereses || []), newInterest.trim()]
    }));
    
    setNewInterest('');
  };
  
  const handleRemoveInterest = (index: number) => {
    setEditData(prev => ({
      ...prev,
      intereses: (prev.intereses || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Actualizar el perfil usando el servicio
      const updatedProfile = await updateUserProfile(profile.id, editData);
      
      // Actualizar también el usuario en localStorage para mantener la coherencia
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        // Solo actualizar los campos que corresponden al usuario básico
        if (editData.nombre) user.nombre = editData.nombre;
        if (editData.apellido) user.apellido = editData.apellido;
        if (editData.ciudad) user.ciudad = editData.ciudad;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (err) {
      console.error('Error al actualizar el perfil:', err);
      setError('No se pudo actualizar el perfil. Intenta de nuevo más tarde.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    // Restaurar datos originales
    setEditData({
      descripcion: profile.descripcion || '',
      fecha_nacimiento: profile.fecha_nacimiento || '',
      intereses: profile.intereses || [],
      ciudad: profile.ciudad || ''
    });
    
    setIsEditing(false);
    setError(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#3d7b6f]">
          Información personal
        </h2>
        
        {isOwnProfile && !isEditing && (
          <button
            id="profile-details-edit-button"
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-[#3d7b6f] transition-colors"
            title="Editar información"
          >
            <BsPencil className="text-lg" />
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
          {success}
        </div>
      )}
      
      <div className="space-y-4">
        {/* Descripción */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Descripción
          </h3>
          {isEditing ? (
            <textarea
              name="descripcion"
              value={editData.descripcion}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={4}
              placeholder="Escribe una descripción sobre ti..."
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-line">
              {profile.descripcion || 'Sin descripción'}
            </p>
          )}
        </div>
        
        {/* Ciudad */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Ciudad
          </h3>
          {isEditing ? (
            <input
              type="text"
              name="ciudad"
              value={editData.ciudad}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="Tu ciudad"
            />
          ) : (
            <p className="text-gray-700">
              {profile.ciudad || 'No especificada'}
            </p>
          )}
        </div>
        
        {/* Fecha de nacimiento */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Fecha de nacimiento
          </h3>
          {isEditing ? (
            <input
              type="date"
              name="fecha_nacimiento"
              value={editData.fecha_nacimiento ? editData.fecha_nacimiento.split('T')[0] : ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          ) : (
            <p className="text-gray-700">
              {profile.fecha_nacimiento ? formatDate(profile.fecha_nacimiento) : 'No especificada'}
            </p>
          )}
        </div>
        
        {/* Intereses */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Intereses
          </h3>
          
          {isEditing ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {(editData.intereses || []).map((interes, index) => (
                  <div 
                    key={index}
                    className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center"
                  >
                    <span>{interes}</span>
                    <button
                      onClick={() => handleRemoveInterest(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <BsX />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
                  placeholder="Nuevo interés"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                />
                <button
                  onClick={handleAddInterest}
                  className="bg-[#3d7b6f] text-white rounded-md px-3 py-2 text-sm"
                >
                  Añadir
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(profile.intereses || []).length > 0 ? (
                profile.intereses?.map((interes, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    {interes}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">Sin intereses</span>
              )}
            </div>
          )}
        </div>
        
        {/* Fecha de registro */}
        {profile.created_at && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Miembro desde
            </h3>
            <p className="text-gray-700">
              {formatDate(profile.created_at)}
            </p>
          </div>
        )}
        
        {/* Botones de acción para edición */}
        {isEditing && (
          <div className="flex justify-end gap-2 pt-2">
            <ActionButton
              variant="secondary"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancelar
            </ActionButton>
            <ActionButton
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              loading={isSaving}
            >
              Guardar cambios
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetails; 