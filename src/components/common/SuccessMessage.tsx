import React, { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface SuccessMessageProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-md z-50 animate-fade-in">
      <div className="flex items-center">
        <FaCheckCircle className="text-green-500 mr-2" />
        <p className="text-green-700">{message}</p>
      </div>
    </div>
  );
};

export default SuccessMessage; 