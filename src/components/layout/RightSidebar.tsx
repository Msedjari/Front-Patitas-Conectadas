import React, { useState, useEffect } from 'react';
import { config } from '../../config';

/**
 * Componente de barra lateral derecha con estilo de Facebook
 * Muestra anuncios, recordatorios de cumpleaños y contactos
 */
const RightSidebar: React.FC = () => {
  // Estados para datos desde el backend
  const [petEvents, setPetEvents] = useState<any[]>([]);
  const [sponsoredContent, setSponsoredContent] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    events: false,
    sponsored: false,
    contacts: false
  });

  // Obtener eventos de mascotas
  useEffect(() => {
    const fetchPetEvents = async () => {
      try {
        setLoading(prev => ({ ...prev, events: true }));
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${config.apiUrl}/mascotas/eventos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPetEvents(data);
        } else {
          console.error('Error al obtener eventos de mascotas:', response.status);
        }
      } catch (error) {
        console.error('Error al cargar eventos de mascotas:', error);
      } finally {
        setLoading(prev => ({ ...prev, events: false }));
      }
    };

    fetchPetEvents();
  }, []);

  // Obtener anuncios patrocinados
  useEffect(() => {
    const fetchSponsored = async () => {
      try {
        setLoading(prev => ({ ...prev, sponsored: true }));
        const response = await fetch(`${config.apiUrl}/anuncios`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSponsoredContent(data);
        } else {
          console.error('Error al obtener anuncios:', response.status);
        }
      } catch (error) {
        console.error('Error al cargar anuncios:', error);
      } finally {
        setLoading(prev => ({ ...prev, sponsored: false }));
      }
    };

    fetchSponsored();
  }, []);

  // Obtener contactos
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(prev => ({ ...prev, contacts: true }));
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${config.apiUrl}/contactos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setContacts(data);
        } else {
          console.error('Error al obtener contactos:', response.status);
        }
      } catch (error) {
        console.error('Error al cargar contactos:', error);
      } finally {
        setLoading(prev => ({ ...prev, contacts: false }));
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="h-full pt-4 pb-4 overflow-y-auto p-3">
      {/* Sección de anuncios */}
      <section className="mb-6">
        <h3 className="text-[#3d7b6f] font-medium text-sm mb-3">Patrocinados</h3>
        
        {loading.sponsored ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6cda84]"></div>
          </div>
        ) : sponsoredContent.length > 0 ? (
          sponsoredContent.map(ad => (
            <a 
              key={ad.id}
              href={ad.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center mb-3 hover:bg-white rounded-lg p-2 transition-colors"
            >
              <div className="w-[120px] h-[80px] bg-white rounded-lg mr-3 overflow-hidden border border-[#a7e9b5]">
                {ad.imagen ? (
                  <img 
                    src={ad.imagen} 
                    alt={ad.titulo} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-ad.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white text-[#3d7b6f] text-xs">
                    Imagen de patrocinador
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#2a2827] font-medium">{ad.titulo}</p>
                <p className="text-xs text-[#575350]">{ad.url_sitio || "patrocinado.com"}</p>
              </div>
            </a>
          ))
        ) : (
          <p className="text-sm text-[#575350] text-center py-2">No hay anuncios disponibles.</p>
        )}
      </section>
      
      {/* Divisor */}
      <div className="border-t border-[#a7e9b5] mb-4"></div>
      
      {/* Recordatorios de mascotas */}
      <section className="mb-6">
        <h3 className="text-[#3d7b6f] font-medium text-sm mb-3">Recordatorios de mascotas</h3>
        
        {loading.events ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6cda84]"></div>
          </div>
        ) : petEvents.length > 0 ? (
          petEvents.map(event => (
            <div key={event.id} className="flex items-center mb-3 p-2 rounded-lg hover:bg-white">
              <div className="w-10 h-10 rounded-full bg-[#a7e9b5] text-[#3d7b6f] flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#2a2827]">
                  <span className="font-medium">{event.mascota_nombre}</span> - {event.tipo}
                </p>
                <p className="text-xs text-[#575350]">{event.fecha}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#575350] text-center py-2">No hay recordatorios disponibles.</p>
        )}
        
        <a 
          href="/recordatorios" 
          className="text-[#2e82dc] text-sm font-medium hover:underline block mt-2"
        >
          Ver todos los recordatorios
        </a>
      </section>
      
      {/* Divisor */}
      <div className="border-t border-[#a7e9b5] mb-4"></div>
      
      {/* Lista de contactos */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[#3d7b6f] font-medium text-sm">Contactos</h3>
          <div className="flex space-x-2">
            <button className="text-[#3d7b6f] hover:bg-white rounded-full w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="text-[#3d7b6f] hover:bg-white rounded-full w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="text-[#3d7b6f] hover:bg-white rounded-full w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <ul className="space-y-1">
          {loading.contacts ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6cda84]"></div>
            </div>
          ) : contacts.length > 0 ? (
            contacts.map(contact => (
              <li key={contact.id}>
                <a 
                  href={`/mensajes/${contact.id}`}
                  className="flex items-center px-2 py-2 rounded-lg hover:bg-white"
                >
                  <div className="relative mr-3">
                    <div className="w-8 h-8 rounded-full bg-white overflow-hidden border border-[#e0e0e0]">
                      {contact.img ? (
                        <img 
                          src={contact.img} 
                          alt={contact.nombre} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/default-avatar.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white text-xs text-[#3d7b6f]">
                          {contact.nombre.charAt(0)}
                        </div>
                      )}
                    </div>
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#6cda84] rounded-full border-2 border-[#f8ffe5]"></span>
                    )}
                  </div>
                  <span className="font-medium text-sm text-[#2a2827]">{contact.nombre}</span>
                </a>
              </li>
            ))
          ) : (
            <p className="text-sm text-[#575350] text-center py-2">No hay contactos disponibles.</p>
          )}
        </ul>
      </section>
      
      {/* Botón de nueva conversación de grupo */}
      <div className="mt-4">
        <button className="flex items-center w-full px-2 py-2 rounded-lg hover:bg-white text-[#2e82dc]">
          <div className="w-8 h-8 rounded-full bg-[#a7e9b5] text-[#3d7b6f] flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium text-sm">Nueva conversación de grupo</span>
        </button>
      </div>
    </div>
  );
};

export default RightSidebar; 