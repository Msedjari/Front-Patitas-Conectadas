import React from 'react';
import { Link } from 'react-router-dom';

const Ayuda: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#2a2827] mb-6">Ayuda y Soporte Técnico</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-8">
          {/* Sección de Preguntas Frecuentes */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Preguntas Frecuentes</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">¿Cómo puedo crear una cuenta?</h3>
                <p className="text-sm text-gray-600">
                  Para crear una cuenta, haz clic en "Registrarse" en la página de inicio y sigue los pasos indicados. 
                  Necesitarás proporcionar tu nombre, correo electrónico y crear una contraseña.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">¿Cómo puedo recuperar mi contraseña?</h3>
                <p className="text-sm text-gray-600">
                  Si olvidaste tu contraseña, puedes usar la opción "¿Olvidaste tu contraseña?" en la página de inicio de sesión. 
                  Recibirás un correo electrónico con instrucciones para restablecerla.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">¿Cómo puedo reportar un problema?</h3>
                <p className="text-sm text-gray-600">
                  Si encuentras algún problema técnico, puedes contactarnos a través del formulario de soporte 
                  o enviando un correo electrónico a soporte@patitasconectadas.com
                </p>
              </div>
            </div>
          </section>

          {/* Sección de Contacto */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">Soporte Técnico</h3>
                <p className="text-sm text-gray-600 mb-2">Para problemas técnicos:</p>
                <a href="mailto:soporte@patitasconectadas.com" className="text-[#2e82dc] hover:text-[#1f68b5]">
                  soporte@patitasconectadas.com
                </a>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">Atención al Usuario</h3>
                <p className="text-sm text-gray-600 mb-2">Para consultas generales:</p>
                <a href="mailto:ayuda@patitasconectadas.com" className="text-[#2e82dc] hover:text-[#1f68b5]">
                  ayuda@patitasconectadas.com
                </a>
              </div>
            </div>
          </section>

          {/* Sección de Recursos */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Recursos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/guia-usuario" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-medium text-[#2a2827] mb-2">Guía del Usuario</h3>
                <p className="text-sm text-gray-600">
                  Aprende a utilizar todas las funciones de Patitas Conectadas
                </p>
              </Link>

              <Link to="/politica-privacidad" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-medium text-[#2a2827] mb-2">Política de Privacidad</h3>
                <p className="text-sm text-gray-600">
                  Información sobre cómo protegemos tus datos
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Ayuda; 