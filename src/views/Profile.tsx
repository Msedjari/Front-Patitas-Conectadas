import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileDetails from '../components/profile/ProfileDetails';
import ProfileMascotas from '../components/profile/ProfileMascotas';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { fetchUserProfile, UserProfile, addFriend, fetchFriendsByUserId } from '../services/userService';
import BotonSeguir from '../components/common/BotonSeguir';
import { userService, User } from '../services/userService';
import { seguidosService } from '../services/seguidosService';
import { getUserImage } from '../components/home/HomeUtils';

/**
 * Vista principal del perfil de usuario
 * 
 * Muestra toda la información del perfil de un usuario, incluyendo
 * datos personales, mascotas y amigos. Si es el perfil del usuario actual,
 * permite editar la información.
 */
const Profile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const profileId = id ? parseInt(id, 10) : user?.id;
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollowStatus, setLoadingFollowStatus] = useState(true);
  const [followActionLoading, setFollowActionLoading] = useState(false);
  
  useEffect(() => {
    if (!profileId) {
      setLoadingProfile(false);
      console.error('No se pudo determinar el ID del perfil a mostrar.');
      return;
    }

    const fetchProfileData = async () => {
      setLoadingProfile(true);
      try {
        const userData = await userService.getUserById(profileId);
        setProfileUser(userData);
      } catch (error) {
        console.error(`Error al cargar perfil ${profileId}:`, error);
        setProfileUser(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [profileId]);

  useEffect(() => {
    console.log("Verificando estado de seguimiento:", { 
      userId: user?.id, 
      profileId, 
      isDifferentProfile: user?.id !== profileId 
    });
    
    if (user?.id && profileId && user.id !== profileId) {
      setLoadingFollowStatus(true);
      const checkFollowingStatus = async () => {
        try {
          const seguidos = await seguidosService.obtenerSeguidosIds(user.id);
          console.log("Seguidos obtenidos:", seguidos);
          const isUserCurrentlyFollowing = seguidos.some(rel => rel.usuarioQueEsSeguidoId === profileId);
          setIsFollowing(isUserCurrentlyFollowing);
        } catch (error) {
          console.error('Error al verificar estado de seguimiento:', error);
          setIsFollowing(false);
        } finally {
          setLoadingFollowStatus(false);
        }
      };
      checkFollowingStatus();
    } else {
      setIsFollowing(false);
      setLoadingFollowStatus(false);
    }
  }, [user?.id, profileId]);

  const handleFollowToggle = async () => {
    if (!user?.id || !profileId || user.id === profileId) return;

    setFollowActionLoading(true);
    try {
      if (isFollowing) {
        await seguidosService.dejarDeSeguirUsuario(user.id, profileId);
        setIsFollowing(false);
        alert('Has dejado de seguir a este usuario.');
      } else {
        await seguidosService.seguirUsuario(user.id, profileId);
        setIsFollowing(true);
        alert('Ahora sigues a este usuario.');
      }
    } catch (error: any) {
      console.error('Error en acción de seguimiento:', error);
      alert(error.message || 'No se pudo realizar la acción.');
    } finally {
      setFollowActionLoading(false);
    }
  };

  if (loadingProfile) {
    return <div className="container mx-auto py-8 max-w-6xl px-4">Cargando perfil...</div>;
  }

  if (!profileUser) {
    return <div className="container mx-auto py-8 max-w-6xl px-4">Perfil no encontrado o error al cargar.</div>;
  }

  console.log("Renderizando perfil:", { 
    profileUser, 
    currentUserId: user?.id, 
    profileId, 
    shouldShowButton: user?.id && profileId && user.id !== profileId 
  });

  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center mb-6">
          <img
            src={getUserImage({}, profileUser.id)}
            alt={profileUser.nombre || 'Usuario'}
            className="w-24 h-24 rounded-full object-cover mr-6"
            onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.svg'; }}
          />
          <div>
            <h1 className="text-3xl font-bold text-[#2a2827]">{profileUser.nombre} {profileUser.apellido}</h1>
            <p className="text-gray-600">{profileUser.email}</p>
            {profileUser.ciudad && <p className="text-gray-600">Ciudad: {profileUser.ciudad}</p>}
            {user && profileUser && user.id !== profileUser.id && (
              <button
                onClick={handleFollowToggle}
                disabled={loadingFollowStatus || followActionLoading}
                className={`mt-4 px-4 py-2 rounded-md transition-colors ${isFollowing ? 'bg-gray-300 hover:bg-gray-400' : 'bg-[#6cda84] text-white hover:bg-[#5aa86d]'}`}
              >
                {loadingFollowStatus || followActionLoading ? 'Cargando...' : (isFollowing ? 'Dejar de seguir' : 'Seguir')}
              </button>
            )}
          </div>
        </div>

        {profileUser.descripcion && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#3d7b6f] mb-2">Sobre mí</h2>
            <p className="text-gray-700">{profileUser.descripcion}</p>
          </div>
        )}

        {profileUser.intereses && profileUser.intereses.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#3d7b6f] mb-2">Intereses</h2>
            <div className="flex flex-wrap gap-2">
              {profileUser.intereses.map((interes, index) => (
                <span key={index} className="bg-[#a7e9b5] text-[#3d7b6f] px-3 py-1 rounded-full text-sm">
                  {interes}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 