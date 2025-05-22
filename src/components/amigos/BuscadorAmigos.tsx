import React, { useState } from 'react';
import { searchUsers, addFriend, removeFriend, fetchFriendsByUserId, User } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const BuscadorAmigos: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<User[]>([]);
  const [amigos, setAmigos] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar amigos existentes al cargar
  React.useEffect(() => {
    if (user?.id) {
      fetchFriendsByUserId(user.id).then(setAmigos);
    }
  }, [user?.id]);

  // Buscar usuarios por query
  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await searchUsers(query);
      setResultados(res);
    } catch (err) {
      setResultados([]);
    }
    setLoading(false);
  };

  // Verificar si ya es amigo
  const esAmigo = (usuarioId: number) => amigos.some(a => a.id === usuarioId);

  // Agregar amigo
  const handleAgregar = async (amigoId: number) => {
    if (!user?.id) return;
    await addFriend(user.id, amigoId);
    setAmigos(await fetchFriendsByUserId(user.id));
  };

  // Eliminar amigo
  const handleEliminar = async (amigoId: number) => {
    if (!user?.id) return;
    await removeFriend(user.id, amigoId);
    setAmigos(await fetchFriendsByUserId(user.id));
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
            <span>{u.nombre} {u.apellido} ({u.email})</span>
            {u.id !== user?.id && (
              esAmigo(u.id) ? (
                <button onClick={() => handleEliminar(u.id)}>Eliminar amigo</button>
              ) : (
                <button onClick={() => handleAgregar(u.id)}>Agregar amigo</button>
              )
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BuscadorAmigos; 