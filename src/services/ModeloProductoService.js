import axios from 'axios';
import { buildApiUrl } from '../config/api';

const baseUrl = buildApiUrl('modelos-producto/');

const ModeloProductoService = {
  async getAllModelos() {
    const response = await axios.get(baseUrl);
    return response.data?.results ?? response.data;
  },
  async crearModelo(nombre) {
    const response = await axios.post(baseUrl, { nombre });
    return response.data;
  },
};

export default ModeloProductoService;
