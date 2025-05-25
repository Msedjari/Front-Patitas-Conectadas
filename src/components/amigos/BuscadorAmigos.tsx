import React, { useState, useEffect } from 'react';
import { searchUsers, addFriend, removeFriend, fetchFriendsByUserId, User } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { getUserImage } from '../home/HomeUtils';

const BuscadorAmigos: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<User[]>([]);
  const [amigos, setAmigos] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userImagesCache, setUserImagesCache] = useState<Record<number, string>>({});

  useEffect(() => {
    const loadUserImagesCache = () => {
      const cachedImages = localStorage.getItem('userImagesCache');
      if (cachedImages) {
        setUserImagesCache(JSON.parse(cachedImages));
      }
    };
    loadUserImagesCache();
  }, []);

  const updateUserImagesCache = (userId: number, imagePath: string) => {
    const newCache = { ...userImagesCache, [userId]: imagePath };
    setUserImagesCache(newCache);
    localStorage.setItem('userImagesCache', JSON.stringify(newCache));
  };

  // Buscar amigos existentes al cargar
  useEffect(() => {
    if (user?.id) {
      fetchFriendsByUserId(Number(user.id)).then(friends => {
        setAmigos(friends);
        // Actualizar el caché de imágenes para cada amigo
        friends.forEach(friend => {
          if (friend.img) {
            updateUserImagesCache(Number(friend.id), friend.img);
          }
        });
      });
    }
  }, [user?.id]);

  // Buscar usuarios por query
  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await searchUsers(query);
      // Actualizar el caché de imágenes para los resultados
      res.forEach(user => {
        if (user.img) {
          updateUserImagesCache(Number(user.id), user.img);
        }
      });
      setResultados(res);
    } catch (err) {
      setResultados([]);
    }
    setLoading(false);
  };

  // Verificar si ya es amigo
  const esAmigo = (usuarioId: number) => amigos.some(a => Number(a.id) === usuarioId);

  // Agregar amigo
  const handleAgregar = async (amigoId: number) => {
    if (!user?.id) return;
    await addFriend(Number(user.id), amigoId);
    const updatedFriends = await fetchFriendsByUserId(Number(user.id));
    setAmigos(updatedFriends);
    // Actualizar el caché de imágenes para el nuevo amigo
    const newFriend = updatedFriends.find(f => Number(f.id) === amigoId);
    if (newFriend?.img) {
      updateUserImagesCache(Number(newFriend.id), newFriend.img);
    }
  };

  // Eliminar amigo
  const handleEliminar = async (amigoId: number) => {
    if (!user?.id) return;
    await removeFriend(Number(user.id), amigoId);
    const updatedFriends = await fetchFriendsByUserId(Number(user.id));
    setAmigos(updatedFriends);
  };

  return (
    <div>
      <form onSubmit={handleBuscar} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar amigos por nombre"
          className="border rounded px-2 py-1"
        />
        <button type="submit" disabled={loading}>Buscar</button>
      </form>
      <ul>
        {resultados.map(u => (
          <li key={u.id} className="flex items-center gap-2 mb-2">
            <img
              src={getUserImage(userImagesCache, Number(u.id))}
              alt={`${u.nombre} ${u.apellido}`}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.svg'; }}
            />
            <span>{u.nombre} {u.apellido} ({u.email})</span>
            {Number(u.id) !== Number(user?.id) && (
              esAmigo(Number(u.id)) ? (
                <button onClick={() => handleEliminar(Number(u.id))}>Eliminar amigo</button>
              ) : (
                <button onClick={() => handleAgregar(Number(u.id))}>Agregar amigo</button>
              )
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BuscadorAmigos; 