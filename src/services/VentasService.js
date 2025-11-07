import axios from 'axios';

const baseUrl = 'http://localhost:8000/api/ventas/';

// Configurar interceptores para mejor manejo de errores
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la respuesta:', error.response?.data);
    return Promise.reject(error);
  }
);

const VentasService = {
  async getAllVentas() {
    try {
      const response = await axios.get(baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw error;
    }
  },

  async crearVenta(venta) {
    try {
      const response = await axios.post(baseUrl, venta);
      return response.data;
    } catch (error) {
      console.error('Error al crear venta:', error);
      throw error;
    }
  },

  async actualizarVenta(id, venta) {
    try {
      // Usar PUT para actualización completa
      const response = await axios.put(`${baseUrl}${id}/`, venta, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar venta:', error);
      throw error;
    }
  },

  // Nuevo método para actualización parcial (solo campos específicos)
  async actualizarEstadoVenta(id, estado, fechaEntrega = null) {
    try {
      const data = {
        estado: estado,
        ...(fechaEntrega && { fecha_entrega_real: fechaEntrega })
      };

      // Usar PATCH para actualización parcial
      const response = await axios.patch(`${baseUrl}${id}/`, data, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estado de venta:', error);
      throw error;
    }
  },

  async eliminarVenta(id) {
    try {
      const response = await axios.delete(`${baseUrl}${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar venta:', error);
      throw error;
    }
  },

  async getVentaById(id) {
    try {
      const response = await axios.get(`${baseUrl}${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener venta por ID:', error);
      throw error;
    }
  },
};

export default VentasService;