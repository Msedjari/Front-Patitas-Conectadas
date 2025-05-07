import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import { Post } from '../components/home/types';
import PostItem from '../components/home/PostItem';

const Guardados: React.FC = () => {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userImagesCache, setUserImagesCache] = useState<{[key: number]: string}>({});
  
  // Cargar posts guardados al montar el componente
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(config.session.tokenKey);
        
        const response = await fetch(`${config.apiUrl}/posts/guardados`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        setSavedPosts(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar posts guardados:', err);
        setError('No se pudieron cargar los posts guardados. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedPosts();
  }, []);
  
  if (loading && savedPosts.length === 0) {
    return (
      <div className="flex justify-center my-5">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6cda84]"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl px-4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-semibold text-[#3d7b6f] mb-6">Posts guardados</h1>
        
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {/* Lista de posts guardados */}
        {savedPosts.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No tienes posts guardados.</p>
            <p className="mt-2 text-[#3d7b6f]">¡Comienza a guardar posts que te interesen!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPosts.map(post => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Guardados; 