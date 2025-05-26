import React from 'react';
import { Link } from 'react-router-dom';

const Configuracion: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Sección de Funciones por implementar */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Funciones por implementar</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Cambio de contraseña. Disponible en el perfil del usuario</li>
                <li>Gestión de sesiones activas</li>
                <li>Configuración de notificaciones</li>
                <li>Preferencias de privacidad</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-[#2a2827] mb-6">Configuración y Privacidad</h1>
      
      <div className="bg-white rounded-lg shadow-md p-i6">
        <div className="space-y-6">
          {/* Sección de Privacidad */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Privacidad</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-[#2a2827]">Visibilidad del perfil</h3>
                  <p className="text-sm text-gray-600">Controla quién puede ver tu perfil</p>
                </div>
                <select className="border rounded-md px-3 py-2">
                  <option value="public">Público</option>
                  <option value="friends">Solo amigos</option>
                  <option value="private">Privado</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-[#2a2827]">Actividad</h3>
                  <p className="text-sm text-gray-600">Controla quién puede ver tu actividad</p>
                </div>
                <select className="border rounded-md px-3 py-2">
                  <option value="public">Público</option>
                  <option value="friends">Solo amigos</option>
                  <option value="private">Privado</option>
                </select>
              </div>
            </div>
          </section>

          {/* Sección de Notificaciones */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Notificaciones</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-[#2a2827]">Notificaciones por email</h3>
                  <p className="text-sm text-gray-600">Recibe actualizaciones por correo electrónico</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-[#2a2827]">Notificaciones push</h3>
                  <p className="text-sm text-gray-600">Recibe notificaciones en el navegador</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Sección de Seguridad */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Seguridad</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">Cambiar contraseña</h3>
                <p className="text-sm text-gray-600 mb-4">Actualiza tu contraseña para mantener tu cuenta segura</p>
                <Link 
                  to="/cambiar-contrasena"
                  className="inline-block px-4 py-2 bg-[#2e82dc] text-white rounded-md hover:bg-[#1f68b5] transition-colors"
                >
                  Cambiar contraseña
                </Link>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">Sesiones activas</h3>
                <p className="text-sm text-gray-600 mb-4">Gestiona tus sesiones activas en otros dispositivos</p>
                <button className="inline-block px-4 py-2 bg-[#2e82dc] text-white rounded-md hover:bg-[#1f68b5] transition-colors">
                  Ver sesiones activas
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Configuracion; 