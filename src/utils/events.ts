// Define tipos de eventos personalizados
export const FOLLOW_CHANGE_EVENT = 'followChange';

// Función para disparar el evento de cambio de seguimiento
export const dispatchFollowChangeEvent = (followerId: number, followedId: number) => {
  const event = new CustomEvent(FOLLOW_CHANGE_EVENT, {
    detail: { followerId, followedId },
  });
  window.dispatchEvent(event);
}; 