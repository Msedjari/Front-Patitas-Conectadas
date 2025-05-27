export interface Post {
  id: number;
  contenido: string;
  fecha: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioApellido: string;
  usuarioImg?: string;
  likes: number;
  comentarios: number;
  meGusta: boolean;
  imagenes?: string[];
} 