import axios from 'axios';

const API_URL = 'http://localhost:8000/api/grupo-imagenes/';

const GrupoImagenesService = {
  
  getImagenesByProducto: async (productoId) => {
    const response = await axios.get(`${API_URL}?producto_id=${productoId}`);
    return response.data;
  },

  subirImagen: async (productoId, imagen, esPrincipal = false, descripcion = '') => {
    const formData = new FormData();
    formData.append('producto', productoId);
    formData.append('imagen', imagen);
    formData.append('es_principal', esPrincipal);
    formData.append('descripcion', descripcion);

    const response = await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  marcarPrincipal: async (imagenId) => {
    const response = await axios.patch(`${API_URL}${imagenId}/marcar_principal/`);
    return response.data;
  },

  eliminarImagen: async (imagenId) => {
    const response = await axios.delete(`${API_URL}${imagenId}/`);
    return response.data;
  },
};

export default GrupoImagenesService;