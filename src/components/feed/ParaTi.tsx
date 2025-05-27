import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Post } from '../../types/Post';
import { PostCard } from '../Savedposts/PostCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { feedService } from '../../services/feedService';

const ParaTi: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const cargarPosts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await feedService.obtenerPostsSeguidos();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPosts();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-[#575350] max-w-md mx-auto px-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-[#6cda84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-xl font-semibold mb-2">No hay posts para mostrar</p>
          <p className="mb-4">Comienza a seguir a otros usuarios para ver sus publicaciones aquí</p>
          <button 
            onClick={() => window.location.href = '/amigos'}
            className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58] transition-colors"
          >
            Descubrir usuarios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#2a2827]">Para ti</h1>
        <span className="text-sm text-[#575350]">{posts.length} publicaciones</span>
      </div>
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onUpdate={cargarPosts}
          />
        ))}
      </div>
    </div>
  );
};

export default ParaTi; 