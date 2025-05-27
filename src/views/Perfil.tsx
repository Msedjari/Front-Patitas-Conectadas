// Intentar primero con el endpoint de perfiles
let profileResponse = await fetch(`${config.apiUrl}/usuarios/${targetUserId}/perfiles`, {
  headers: getAuthHeaders(false)
});

console.log('Respuesta del perfil:', profileResponse.status);

if (!profileResponse.ok) {
  if (profileResponse.status === 404) {
    // Si no hay perfil, mostrar el formulario de creación
    console.log('No se encontró perfil, mostrando formulario de creación');
    setEditMode(true);
    setProfile({
      usuario_id: parseInt(targetUserId),
      descripcion: '',
      fecha_nacimiento: '',
      img: ''
    });
    setDescripcion('');
    setFechaNacimiento('');
    setImagePreview(null);
    setProfileImageUrl('');
  } else {
    const errorText = await profileResponse.text();
    console.error('Error al cargar perfil:', errorText);
    throw new Error(`Error al cargar el perfil: ${errorText}`);
  }
} else {
  // ... existing code ...
} 