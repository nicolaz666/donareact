import axios from 'axios';

import { buildApiUrl } from '../config/api';

const baseUrl = buildApiUrl('notas/');

const NotaService = {
  async getAllNotas() {
    const response = await axios.get(baseUrl);
    return response.data?.results ?? response.data;
  },

  async getNotaById(id) {
    const response = await axios.get(`${baseUrl}${id}/`);
    return response.data;
  },

  async crearNota(nota) {
    const response = await axios.post(baseUrl, nota);
    return response.data;
  },

  async actualizarNota(id, nota) {
    const response = await axios.put(`${baseUrl}${id}/`, nota);
    return response.data;
  },

  async eliminarNota(id) {
    const response = await axios.delete(`${baseUrl}${id}/`);
    return response.data;
  },
};

export default NotaService;
