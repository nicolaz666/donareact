import axios from 'axios';
import { buildApiUrl } from '../config/api';

const baseUrl = buildApiUrl('tipos-producto/');

const TipoProductoService = {
  async getAllTipos() {
    const response = await axios.get(baseUrl);
    return response.data?.results ?? response.data;
  },
  async crearTipo(nombre) {
    const response = await axios.post(baseUrl, { nombre });
    return response.data;
  },
};

export default TipoProductoService;
