import React from 'react';
import { User } from '../../services/userService';
import { Link } from 'react-router-dom'; // Para enlazar al perfil
import { getUserImage } from '../home/HomeUtils'; // Asumiendo que tienes una utilidad para obtener la imagen
import { config } from '../../config'; // Para acceder al session.tokenKey si getUserImage lo necesita

interface Props {
  seguidos: User[];
  onDejarDeSeguir: (usuarioId: number) => void;
}

const SeguidosList: React.FC<Props> = ({ seguidos, onDejarDeSeguir }) => {
  const [userImagesCache, setUserImagesCache] = React.useState<Record<number, string>>({}); // Cache para imágenes

  // Efecto para cargar imágenes (similar a Sidebar o Navbar)
   React.useEffect(() => {
    seguidos.forEach(async (usuario) => {
      if (usuario.id && !userImagesCache[usuario.id]) {
        try {
          const token = localStorage.getItem(config.session.tokenKey);
          if (!token) return;

          const response = await fetch(`${config.apiUrl}/usuarios/${usuario.id}/perfiles`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const profileData = await response.json();
            if (profileData && profileData.img) {
              setUserImagesCache(prev => ({
                ...prev,
                [usuario.id]: profileData.img
              }));
            } else {
               // Usar imagen por defecto si no hay imagen en el perfil
               setUserImagesCache(prev => ({
                ...prev,
                [usuario.id]: '/default-avatar.svg' // Asegúrate de tener esta imagen
              }));
            }
          } else {
             // Usar imagen por defecto en caso de error
             setUserImagesCache(prev => ({
              ...prev,
              [usuario.id]: '/default-avatar.svg'
            }));
          }
        } catch (error) {
          console.error(`Error al cargar imagen de usuario ${usuario.id}:`, error);
          // Usar imagen por defecto si hay un error de red, etc.
           setUserImagesCache(prev => ({
            ...prev,
            [usuario.id]: '/default-avatar.svg'
          }));
        }
      }
    });
  }, [seguidos, userImagesCache]);


  if (seguidos.length === 0) {
    return <p>Todavía no sigues a nadie.</p>;
  }

  return (
    <ul className="space-y-4">
      {seguidos.map(usuario => (
        <li key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-white">
          <Link to={`/perfil/${usuario.id}`} className="flex items-center flex-grow min-w-0">
            <img
              src={userImagesCache[usuario.id] || '/default-avatar.svg'} // Usar cache o default
              alt={usuario.nombre || 'Usuario'}
              className="w-10 h-10 rounded-full object-cover mr-3"
              onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.svg'; }} // Fallback en error
            />
            <span className="font-medium text-[#2a2827] truncate">{usuario.nombre} {usuario.apellido}</span>
          </Link>
          <button
            onClick={() => onDejarDeSeguir(usuario.id)}
            className="ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Dejar de seguir
          </button>
        </li>
      ))}
    </ul>
  );
};

export default SeguidosList; 