import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../services/userService';
import { getUserImage } from '../home/HomeUtils';
import BotonSeguir from '../common/BotonSeguir';

interface SeguidosListProps {
  seguidos: User[];
  onDejarDeSeguir: (usuarioId: number) => void;
}

const SeguidosList: React.FC<SeguidosListProps> = ({ seguidos, onDejarDeSeguir }) => {
  if (seguidos.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No sigues a ningún usuario aún.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {seguidos.map((seguido) => (
        <div key={seguido.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow duration-200">
          <Link
            to={`/perfil/${seguido.id}`}
            className="flex items-center flex-grow"
          >
            <img
              src={getUserImage({}, seguido.id)}
              alt={seguido.nombre || 'Usuario'}
              className="w-12 h-12 rounded-full object-cover mr-3"
              onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.svg'; }}
            />
            <div>
              <h3 className="font-medium text-[#2a2827]">{seguido.nombre} {seguido.apellido}</h3>
              <p className="text-sm text-gray-500">{seguido.email}</p>
            </div>
          </Link>
          <div className="ml-4">
            <BotonSeguir 
              usuarioId={seguido.id}
              onDejarDeSeguir={() => onDejarDeSeguir(seguido.id)}
              nombreUsuario={`${seguido.nombre} ${seguido.apellido}`}
              siguiendoInicial={true}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeguidosList; 