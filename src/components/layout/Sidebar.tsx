import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserImage } from '../home/HomeUtils';
import { config } from '../../config';

/**
 * Componente de Barra Lateral Izquierda
 * 
 * Muestra la información del usuario actual, junto con enlaces de navegación 
 * principales y accesos directos a grupos. Esta barra lateral permanece fija
 * en la interfaz y proporciona navegación contextual dentro de la aplicación.
 * 
 * Características:
 * - Muestra el perfil del usuario actual
 * - Proporciona enlaces a secciones principales (Amigos, Grupos, etc.)
 * - Muestra accesos directos a grupos frecuentes
 * - Implementa iconos visuales para cada sección
 */
const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [userImagesCache, setUserImagesCache] = useState<Record<number, string>>({});

  // Efecto para cargar la imagen del usuario
  useEffect(() => {
    if (user?.id) {
      const fetchUserImage = async () => {
        try {
          const token = localStorage.getItem(config.session.tokenKey);
          if (!token) return;

          // Intentar obtener la imagen del perfil
          const response = await fetch(`${config.apiUrl}/usuarios/${user.id}/perfiles`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });

          if (response.ok) {
            const profileData = await response.json();
            if (profileData && profileData.img) {
              setUserImagesCache(prev => ({
                ...prev,
                [user.id]: profileData.img
              }));
            }
          }
        } catch (error) {
          console.error('Error al cargar imagen de usuario:', error);
        }
      };

      fetchUserImage();
    }
  }, [user?.id]);

  // Efecto para escuchar cambios en el caché de imágenes
  useEffect(() => {
    const handleUserImageUpdate = (e: CustomEvent) => {
      const { userId, imagePath } = e.detail;
      setUserImagesCache(prev => ({
        ...prev,
        [userId]: imagePath
      }));
    };

    window.addEventListener('userImageUpdated', handleUserImageUpdate as EventListener);
    return () => window.removeEventListener('userImageUpdated', handleUserImageUpdate as EventListener);
  }, []);

  // Elementos de la barra lateral con sus iconos y rutas
  const sidebarItems = [
    { name: 'Amigos', icon: 'users', path: '/amigos' },
    { name: 'Guardados', icon: 'bookmark', path: '/guardados' },
    { name: 'Grupos', icon: 'users-group', path: '/grupos' },
    { name: 'Eventos', icon: 'calendar', path: '/eventos' },
    { name: 'Fotos', icon: 'photos', path: '/fotos' },
  ];

  // Accesos directos a grupos
  const shortcuts = [
    { name: 'Grupo Adopción Perros', icon: 'group', path: '/grupos/perros' },
    { name: 'Asociación Protectoras', icon: 'group', path: '/grupos/protectoras' },
    { name: 'Veterinarios Unidos', icon: 'group', path: '/grupos/veterinarios' },
  ];

  /**
   * Función para renderizar el icono adecuado según el tipo
   * @param icon - Identificador del icono a renderizar
   */
  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'users':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2e82dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'bookmark':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6cda84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        );
      case 'users-group':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2e82dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6cda84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'group':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#3d7b6f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col p-3 overflow-y-auto">
      {/* User profile link */}
      <Link 
        to="/perfil" 
        className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-[#f8ffe5] transition-colors ${location.pathname === '/perfil' ? 'bg-[#f8ffe5]' : ''}`}
      >
        <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
          <img 
            src={getUserImage(userImagesCache, user?.id)} 
            alt={user?.nombre || user?.name || "Usuario"} 
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-avatar.svg';
            }}
          />
        </div>
        <span className="text-[#2a2827] font-medium">{user?.nombre || user?.name || "Usuario"}</span>
      </Link>
      
      {/* Navegación principal */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className="flex items-center px-2 py-3 rounded-lg hover:bg-white transition-colors"
              >
                <span className="inline-flex items-center justify-center h-8 w-8 mr-3">
                  {renderIcon(item.icon)}
                </span>
                <span className="text-[#2a2827] font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Separador */}
      <div className="my-4 border-t border-gray-200"></div>
      
      {/* Título de accesos directos */}
      <h3 className="px-2 text-[#3d7b6f] font-medium mb-2">Tus accesos directos</h3>
      
      {/* Lista de accesos directos */}
      <nav>
        <ul className="space-y-1">
          {shortcuts.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className="flex items-center px-2 py-2 rounded-lg hover:bg-white transition-colors"
              >
                <span className="inline-flex items-center justify-center h-8 w-8 mr-3 bg-gray-200 rounded-md overflow-hidden">
                  {renderIcon(item.icon)}
                </span>
                <span className="text-[#2a2827] text-sm">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Pie de página */}
      <div className="mt-4 px-2 text-xs text-[#575350]">
        <p>Privacidad · Términos · Publicidad · Cookies · Más · Patitas Conectadas © 2025</p>
      </div>
    </div>
  );
};

export default Sidebar; 