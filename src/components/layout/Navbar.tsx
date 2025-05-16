import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import logoImage from '../../assets/logo.png'; // Importación del logo
import { getUserImage } from '../home/HomeUtils';
import { searchUsers, User } from '../../services/userService';

/**
 * Navbar Component
 * 
 * Barra de navegación superior que contiene el logo, barra de búsqueda, 
 * iconos de navegación y menú de usuario. Maneja el estado de autenticación 
 * y muestra las opciones de navegación apropiadas según si un usuario ha 
 * iniciado sesión o no.
 * 
 * Funcionalidades principales:
 * - Navegación a secciones principales de la aplicación
 * - Acceso al perfil de usuario y menú desplegable
 * - Opciones de inicio/cierre de sesión
 * 
 * Nota: Este componente solo se muestra en vista desktop. 
 * La navegación móvil se maneja con MobileBottomNav.
 */
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // State to control user menu dropdown visibility
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // State for unread notification count - ahora comentado
  // const [notificationCount, setNotificationCount] = useState(0);
  const [userImagesCache, setUserImagesCache] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  /**
   * Fetch unread notifications when user is authenticated - ahora comentado
   */
  /*
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // API call to fetch unread notifications
        const response = await fetch(`${config.apiUrl}/notificaciones/no-leidas`);
        const data = await response.json();
        setNotificationCount(data.count);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotificationCount(0);
      }
    };
    
    // Only fetch notifications if user is authenticated
    if (user) {
      fetchNotifications();
    }
  }, [user]);
  */
  
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
  
  // Cerrar el menú desplegable al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Efecto para manejar clics fuera del área de búsqueda
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Efecto para buscar usuarios cuando cambia la consulta
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        try {
          setIsSearching(true);
          setSearchError(null);
          const results = await searchUsers(searchQuery);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error('Error al buscar usuarios:', error);
          setSearchError('Error al buscar usuarios. Por favor, intenta de nuevo.');
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
        setSearchError(null);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);
  
  /**
   * Handle user logout
   * Executes the logout function from auth context and redirects to login page
   */
  const handleLogout = () => {
    // Close user menu if open
    setUserMenuOpen(false);
    
    // Execute logout from auth context
    logout();
    
    // Redirect to login page
    navigate('/login');
  };
  
  /**
   * Handle navigation to profile page
   */
  const handleProfileClick = () => {
    // Close user menu if open
    setUserMenuOpen(false);
    
    // Navigate to profile page
    navigate('/perfil');
  };
  
  return (
    <nav className="bg-[#f8ffe5] shadow-md fixed top-0 left-0 right-0 h-14 z-50">
      <div className="max-w-screen-2xl mx-auto px-3 h-full flex items-center justify-between">
        {/* Left section: Logo and search */}
        <div className="flex items-center space-x-2">
          {/* Logo with link to home */}
          <Link to="/" className="flex items-center">
            <img src={logoImage} alt="Logo" className="w-12 h-12" />
          </Link>
          
          {/* Search bar with icon */}
          <div className="relative" ref={searchRef}>
            <input 
              type="text" 
              placeholder="Buscar usuarios..." 
              className="bg-white rounded-full py-2 pl-10 pr-4 w-[240px] focus:outline-none focus:ring-2 focus:ring-[#6cda84] border border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length > 2 && setShowResults(true)}
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-[#3d7b6f]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>

            {/* Resultados de búsqueda */}
            {showResults && (
              <div className="absolute top-full left-0 mt-2 w-[300px] bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-[#3d7b6f]">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6cda84] mx-auto"></div>
                    <p className="mt-2">Buscando...</p>
                  </div>
                ) : searchError ? (
                  <div className="p-4 text-center text-red-500">
                    <p>{searchError}</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    {searchResults.map((user) => (
                      <Link
                        key={user.id}
                        to={`/perfil/${user.id}`}
                        className="flex items-center space-x-3 p-3 hover:bg-[#f8ffe5] border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setShowResults(false);
                          setSearchQuery('');
                          setSearchError(null);
                        }}
                      >
                        <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
                          <img 
                            src={getUserImage(userImagesCache, user.id)} 
                            alt={user.nombre} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/default-avatar.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[#2a2827] hover:text-[#6cda84] transition-colors">
                            {user.nombre} {user.apellido}
                          </p>
                          <p className="text-sm text-[#575350]">{user.email}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-[#575350]">
                    No se encontraron resultados
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Center section: Main navigation icons */}
        <div className="flex items-center justify-center flex-1">
          <div className="flex items-center justify-center space-x-1 max-w-md mx-auto w-full">
            {/* Home icon */}
            <Link to="/" className="flex-1 px-3 py-2 rounded-md text-[#6cda84] hover:bg-white transition-colors flex justify-center border-b-2 border-[#6cda84]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.1L1 12h3v9h6v-6h4v6h6v-9h3L12 2.1zm0 2.691l6 5.4V19h-2v-6H8v6H6v-8.809l6-5.4z"/>
              </svg>
            </Link>
            
            {/* Shelter/Rescue icon */}
            <Link to="/protectoras" className="flex-1 px-3 py-2 rounded-md text-[#3d7b6f] hover:bg-white transition-colors flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm4-9h-3V8a1 1 0 10-2 0v4a1 1 0 001 1h4a1 1 0 100-2z"/>
              </svg>
            </Link>
            
            {/* Groups icon */}
            <Link to="/grupos" className="flex-1 px-3 py-2 rounded-md text-[#3d7b6f] hover:bg-white transition-colors flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 000 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c.37-.06.74-.1 1.13-.1.99 0 1.93.21 2.78.58.86.37 1.96 1.27 1.96 2.82V18h-4.5v-1.61c0-.83-.23-1.61-.63-2.29zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
              </svg>
            </Link>
            
            {/* Events icon */}
            <Link to="/eventos" className="flex-1 px-3 py-2 rounded-md text-[#3d7b6f] hover:bg-white transition-colors flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 10v8l7-4zm12-4h-7.58l3.29-3.29L16 2l-4 4h-.03l-4-4-.69.71L10.56 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12z"/>
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Right section: User controls */}
        <div className="flex items-center space-x-2">
          {/* Notification and message buttons - Only visible for authenticated users */}
          {user && (
            <>
              {/* Notifications button with counter badge - ahora comentado */}
              {/*
              <button className="p-2 rounded-full bg-white hover:bg-gray-200 text-[#3d7b6f] relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-[#2e82dc] rounded-full">
                    {notificationCount}
                  </span>
                )}
              </button>
              */}
              
              {/* Messages button */}
              <button className="p-2 rounded-full bg-white hover:bg-gray-200 text-[#3d7b6f]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </button>
            </>
          )}
          
          {/* Authentication: Login and register buttons for non-authenticated users */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-1"
              >
                <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden border-2 border-[#6cda84]">
                  <img 
                    src={getUserImage(userImagesCache, user.id)} 
                    alt={user.nombre || user.name || "Usuario"} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-avatar.svg';
                    }}
                  />
                </div>
              </button>
              
              {/* User menu dropdown content */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-[320px] bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                  {/* User profile summary */}
                  <div className="p-4 border-b border-gray-200">
                    <Link 
                      to="/perfil" 
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-3 hover:bg-[#f8ffe5] p-2 rounded-lg"
                    >
                      <div className="h-12 w-12 rounded-full bg-gray-300 overflow-hidden">
                        <img 
                          src={getUserImage(userImagesCache, user.id)} 
                          alt={user.nombre || user.name || "Usuario"} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/default-avatar.svg';
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-[#2a2827]">{user.nombre || user.name}</p>
                        <p className="text-sm text-[#575350]">Ver tu perfil</p>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Menu options */}
                  <div className="py-2">
                    {/* Settings and privacy */}
                    <Link to="/perfiles" 
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-3 hover:bg-[#f8ffe5]"
                    >
                      <div className="bg-[#a7e9b5] rounded-full p-2 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3d7b6f]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8zm1-11v4h4v2h-6V9h2z"/>
                        </svg>
                      </div>
                      <span className="text-[#2a2827]">Configuración y privacidad</span>
                    </Link>
                    
                    {/* Help and support */}
                    <Link to="/ayuda" 
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-3 hover:bg-[#f8ffe5]"
                    >
                      <div className="bg-[#a7e9b5] rounded-full p-2 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3d7b6f]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                        </svg>
                      </div>
                      <span className="text-[#2a2827]">Ayuda y soporte técnico</span>
                    </Link>
                    
                    {/* Logout option */}
                    <button 
                      className="flex items-center w-full px-4 py-3 hover:bg-[#f8ffe5] text-left"
                      onClick={handleLogout}
                    >
                      <div className="bg-[#a7e9b5] rounded-full p-2 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3d7b6f]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                        </svg>
                      </div>
                      <span className="text-[#2a2827]">Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login" className="px-4 py-2 text-[#3d7b6f] hover:text-[#2a2827]">
                Iniciar sesión
              </Link>
              <Link to="/register" className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58]">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 