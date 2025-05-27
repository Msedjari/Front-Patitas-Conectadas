import { config } from '../config';
import { Post } from '../types/Post';

class FeedService {
  private token: string | null;

  constructor() {
    this.token = localStorage.getItem(config.session.tokenKey);
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async obtenerPostsSeguidos(): Promise<Post[]> {
    try {
      const response = await fetch(`${config.apiUrl}/posts/seguidos`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Error al obtener los posts de usuarios seguidos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerPostsSeguidos:', error);
      throw error;
    }
  }

  async darLike(postId: number): Promise<void> {
    try {
      const response = await fetch(`${config.apiUrl}/posts/${postId}/like`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Error al dar like al post');
      }
    } catch (error) {
      console.error('Error en darLike:', error);
      throw error;
    }
  }

  async quitarLike(postId: number): Promise<void> {
    try {
      const response = await fetch(`${config.apiUrl}/posts/${postId}/like`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Error al quitar like del post');
      }
    } catch (error) {
      console.error('Error en quitarLike:', error);
      throw error;
    }
  }

  async comentar(postId: number, contenido: string): Promise<void> {
    try {
      const response = await fetch(`${config.apiUrl}/posts/${postId}/comentarios`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ contenido })
      });

      if (!response.ok) {
        throw new Error('Error al comentar en el post');
      }
    } catch (error) {
      console.error('Error en comentar:', error);
      throw error;
    }
  }
}

export const feedService = new FeedService(); 