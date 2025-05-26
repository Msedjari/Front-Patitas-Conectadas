import React from 'react';
import { Link } from 'react-router-dom';

const PoliticaPrivacidad: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#2a2827] mb-6">Política de Privacidad</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-8">
          {/* Introducción */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Introducción</h2>
            <p className="text-gray-600 mb-4">
              En Patitas Conectadas, nos comprometemos a proteger tu privacidad y tus datos personales. 
              Esta política describe cómo recopilamos, usamos y protegemos tu información.
            </p>
          </section>

          {/* Información que Recopilamos */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Información que Recopilamos</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">Información Personal</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Nombre y apellidos</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Información de contacto</li>
                  <li>Foto de perfil</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">Información de Uso</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Actividad en la plataforma</li>
                  <li>Interacciones con otros usuarios</li>
                  <li>Preferencias y configuraciones</li>
                  <li>Datos de navegación</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Uso de la Información */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Uso de la Información</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">¿Cómo usamos tu información?</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Proporcionar y mejorar nuestros servicios</li>
                  <li>Personalizar tu experiencia</li>
                  <li>Comunicarnos contigo</li>
                  <li>Mantener la seguridad de la plataforma</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Protección de Datos */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Protección de Datos</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">Medidas de Seguridad</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Encriptación de datos sensibles</li>
                  <li>Acceso restringido a la información</li>
                  <li>Monitoreo regular de seguridad</li>
                  <li>Actualizaciones periódicas de seguridad</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tus Derechos */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Tus Derechos</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">¿Qué derechos tienes?</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Acceder a tus datos personales</li>
                  <li>Rectificar información incorrecta</li>
                  <li>Solicitar la eliminación de tus datos</li>
                  <li>Oponerte al procesamiento de datos</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Contacto</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Si tienes preguntas sobre nuestra política de privacidad, puedes contactarnos en:
              </p>
              <a href="mailto:privacidad@patitasconectadas.com" className="text-[#2e82dc] hover:text-[#1f68b5]">
                privacidad@patitasconectadas.com
              </a>
            </div>
          </section>

          {/* Enlaces Útiles */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Enlaces Útiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/ayuda" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-medium text-[#2a2827] mb-2">Centro de Ayuda</h3>
                <p className="text-sm text-gray-600">
                  Encuentra respuestas a preguntas frecuentes
                </p>
              </Link>

              <Link to="/guia-usuario" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-medium text-[#2a2827] mb-2">Guía del Usuario</h3>
                <p className="text-sm text-gray-600">
                  Aprende a utilizar todas las funciones
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PoliticaPrivacidad; 