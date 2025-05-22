import React, { useState } from 'react';
import DeletePostButton from './DeletePostButton';

const PostContent = ({ post, currentUser, onPostUpdated }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const isAuthor = currentUser?.id === post.userId;
  
  return (
    <div className="post-container">
      {/* Menú de tres puntos */}
      <div className="relative">
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
            {/* Botón de eliminar */}
            <DeletePostButton 
              postId={post.id} 
              isAuthor={isAuthor}
              onPostDeleted={() => {
                setMenuOpen(false);
                onPostUpdated(); // Actualizar la lista de posts después de eliminar
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostContent; 