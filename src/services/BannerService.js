import axios from 'axios';

import { buildApiUrl } from '../config/api';

const baseUrl = buildApiUrl('banners/');

const BannerService = {
  async getAllBanners() {
    const response = await axios.get(baseUrl);
    return response.data?.results ?? response.data;
  },

  async getBannerById(id) {
    const response = await axios.get(`${baseUrl}${id}/`);
    return response.data;
  },

  async crearBanner(banner) {
    const formData = new FormData();
    formData.append('tipo', banner.tipo);
    formData.append('activo', banner.activo ?? false);
    if (banner.video) formData.append('video', banner.video);

    const response = await axios.post(baseUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async actualizarBanner(id, banner) {
    const formData = new FormData();
    formData.append('tipo', banner.tipo);
    formData.append('activo', banner.activo ?? false);
    if (banner.video) formData.append('video', banner.video);

    const response = await axios.put(`${baseUrl}${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async eliminarBanner(id) {
    const response = await axios.delete(`${baseUrl}${id}/`);
    return response.data;
  },
};

export default BannerService;
