import axios from 'axios';

import { buildApiUrl } from '../config/api';

const API_URL = buildApiUrl('nota-imagenes/');

const NotaImagenService = {
  getImagenesByNota: async (notaId) => {
    const response = await axios.get(`${API_URL}?nota_id=${notaId}`);
    return response.data?.results ?? response.data;
  },

  subirImagen: async (notaId, imagen, esPrincipal = false, orden = 0) => {
    const formData = new FormData();
    formData.append('nota', notaId);
    formData.append('imagen', imagen);
    formData.append('es_principal', esPrincipal);
    formData.append('orden', orden);

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

export default NotaImagenService;
