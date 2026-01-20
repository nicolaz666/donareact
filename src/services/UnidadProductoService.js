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

  async actualizarEstado(id, nuevoEstado) {
  try {
    console.log(`🔄 Actualizando unidad #${id} a estado: ${nuevoEstado}`);
    
    const response = await axios.patch(`${baseUrl}${id}/`, {
      estado: nuevoEstado
    });
    
    console.log('✅ Unidad actualizada:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en actualizarEstado:', error.response?.data || error.message);
    
    // Si PATCH falla, intentar con PUT
    if (error.response?.status === 405) {
      console.log('⚠️ PATCH no soportado, intentando con PUT...');
      const unidadActual = await this.getUnidadProductoById(id);
      const unidadActualizada = {
        ...unidadActual,
        estado: nuevoEstado
      };
      const responsePut = await axios.put(`${baseUrl}${id}/`, unidadActualizada);
      return responsePut.data;
    }
    
    throw error;
  }
}
};

export default UnidadProductoService;