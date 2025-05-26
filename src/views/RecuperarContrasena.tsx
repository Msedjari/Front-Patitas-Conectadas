import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';

const RecuperarContrasena: React.FC = () => {
  return (
    <AuthLayout>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#2a2827] mb-4">Recuperación de Contraseña</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Sentimos las molestias, esta función está pendiente de implementar.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                Mientras tanto, puedes enviar un email a:
                <br />
                <a href="mailto:fdiaz@elpuig.xeill.net" className="text-[#2e82dc] hover:text-[#1f68b5]">
                  fdiaz@elpuig.xeill.net
                </a>
                <br />
                o
                <br />
                <a href="mailto:msedjari@elpuig.xeill.net" className="text-[#2e82dc] hover:text-[#1f68b5]">
                  msedjari@elpuig.xeill.net
                </a>
              </p>
            </div>
          </div>
        </div>

        <Link 
          to="/login" 
          className="inline-block px-6 py-2 bg-[#2e82dc] text-white rounded-md hover:bg-[#1f68b5] transition-colors"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RecuperarContrasena; 