import axios from 'axios';

const baseUrl = 'http://localhost:8000/api/Unidadproductos/'; // Ajusta la URL según tu API

const UnidadProductoService = {
  async getAllUnidadProductos() {
    const response = await axios.get(baseUrl);
    return response.data;
  },

  async crearUnidadProducto(unidad) {
    const response = await axios.post(baseUrl, unidad);
    return response.data;
  },

  async actualizarUnidadProducto(id, unidad) {
    const response = await axios.put(`${baseUrl}${id}/`, unidad);
    return response.data;
  },

  async eliminarUnidadProducto(id) {
    const response = await axios.delete(`${baseUrl}${id}/`);
    return response.data;
  },

  async getUnidadProductoById(id) {
    const response = await axios.get(`${baseUrl}${id}/`);
    return response.data;
  },
};

export default UnidadProductoService;