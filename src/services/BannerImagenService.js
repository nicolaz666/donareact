import axios from 'axios';

import { buildApiUrl } from '../config/api';

const API_URL = buildApiUrl('banner-imagenes/');

const BannerImagenService = {
  getImagenesByBanner: async (bannerId) => {
    const response = await axios.get(`${API_URL}?banner_id=${bannerId}`);
    return response.data?.results ?? response.data;
  },

  subirImagen: async (bannerId, imagen, orden = 0) => {
    const formData = new FormData();
    formData.append('banner', bannerId);
    formData.append('imagen', imagen);
    formData.append('orden', orden);

    const response = await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  eliminarImagen: async (imagenId) => {
    const response = await axios.delete(`${API_URL}${imagenId}/`);
    return response.data;
  },
};

export default BannerImagenService;
