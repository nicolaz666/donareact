import axios from 'axios';
import { buildApiUrl } from '../config/api';

const baseUrl = buildApiUrl('colores/');

const ColorService = {
  async getAllColores() {
    const response = await axios.get(baseUrl);
    return response.data?.results ?? response.data;
  },
  async crearColor(nombre) {
    const response = await axios.post(baseUrl, { nombre });
    return response.data;
  },
};

export default ColorService;
