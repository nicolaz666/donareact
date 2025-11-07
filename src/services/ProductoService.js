import axios from 'axios';

const baseUrl = 'http://localhost:8000/api/productos/';

const ProductoService = {
  async getAllProductos() {
    const response = await axios.get(baseUrl);
    return response.data;
  },

  async crearProducto(Producto) {
    const response = await axios.post(baseUrl, Producto);
    return response.data;
  },

  async actualizarProducto(id, Producto) {
    const response = await axios.put(`${baseUrl}${id}/`, Producto);
    return response.data;
  },

  async eliminarProducto(id) {
    const response = await axios.delete(`${baseUrl}${id}/`);
    return response.data;
  },

  async getProductoById(id) {
    const response = await axios.get(`${baseUrl}${id}/`);
    return response.data;
  },
};

export default ProductoService;