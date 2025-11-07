import axios from 'axios';

const baseUrl = 'http://localhost:8000/api/categorias/';

const CategoriaService = {
  async getAllCategorias() {
    const response = await axios.get(baseUrl);
    return response.data;
  },

  async crearCategoria(categoria) {
    const response = await axios.post(baseUrl, categoria);
    return response.data;
  },

  async actualizarCategoria(id, categoria) {
    const response = await axios.put(`${baseUrl}${id}/`, categoria);
    return response.data;
  },

  async eliminarCategoria(id) {
    const response = await axios.delete(`${baseUrl}${id}/`);
    return response.data;
  },

  async getCategoriaById(id) {
    const response = await axios.get(`${baseUrl}${id}/`);
    return response.data;
  },
};

export default CategoriaService;