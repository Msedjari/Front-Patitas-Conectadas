import React, { useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface DeletePostButtonProps {
  postId: number;
  isAuthor: boolean;
  onPostDeleted: () => void;
}

const DeletePostButton: React.FC<DeletePostButtonProps> = ({ postId, isAuthor, onPostDeleted }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isAuthor) return null;

  return (
    <>
      <button
        onClick={() => setShowConfirmation(true)}
        className="text-red-600 hover:text-red-800 w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Eliminar publicación
      </button>
      
      {showConfirmation && (
        <DeleteConfirmationModal
          postId={postId}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={() => {
            setShowConfirmation(false);
            onPostDeleted();
          }}
        />
      )}
    </>
  );
};

export default DeletePostButton; 