import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileDetails from '../components/profile/ProfileDetails';
import ProfileMascotas from '../components/profile/ProfileMascotas';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { fetchUserProfile, UserProfile } from '../services/userService';

/**
 * Vista principal del perfil de usuario
 * 
 * Muestra toda la información del perfil de un usuario, incluyendo
 * datos personales, mascotas y amigos. Si es el perfil del usuario actual,
 * permite editar la información.
 */
const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Determinar si es el perfil del usuario actual
  const isOwnProfile = !id || (authUser && id === authUser.id.toString());
  const userId = isOwnProfile && authUser ? authUser.id : id ? parseInt(id) : undefined;
  
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!userId && !authUser) {
          // Si no hay un userId ni un usuario autenticado, redirigir al login
          navigate('/login', { replace: true });
          return;
        }
        
        const userProfile = await fetchUserProfile(userId);
        
        // Si no se encontró el perfil, crear un perfil con datos básicos
        if (!userProfile) {
          if (isOwnProfile && authUser) {
            // Si es el propio perfil, usar los datos del usuario autenticado
            setProfile({
              id: authUser.id,
              nombre: authUser.nombre || '',
              apellido: authUser.apellido || '',
              email: authUser.email || '',
              descripcion: '',
              ciudad: ''
            });
          } else {
            // Si es otro usuario y no tiene perfil, mostrar error
            throw new Error('El perfil solicitado no existe');
          }
        } else {
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Error al cargar el perfil de usuario:', err);
        setError('No se pudo cargar la información del perfil. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [userId, authUser, navigate, isOwnProfile]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          message={error}
          onClose={() => setError(null)}
        />
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          message="No se encontró el perfil solicitado."
          onClose={() => navigate('/', { replace: true })}
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Sección de cabecera del perfil */}
        <ProfileHeader 
          profile={profile} 
          isOwnProfile={isOwnProfile}
        />
        
        <div className="mt-8">
          {/* Sección de detalles del perfil */}
          <ProfileDetails 
            profile={profile}
            isOwnProfile={isOwnProfile}
          />
          
          {/* Sección de mascotas */}
          <ProfileMascotas 
            userId={profile.id}
            isOwnProfile={isOwnProfile}
          />
          
          {/* Sección de amigos */}
          <ProfileAmigos 
            userId={profile.id}
            isOwnProfile={isOwnProfile}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile; 