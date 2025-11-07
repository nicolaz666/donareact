import axios from 'axios';

const API_URL = 'http://localhost:8000/api/direcciones/'; // reemplaza con tu URL de API

const DireccionService = {

  agregarDireccion: async (clienteId, direccion) => {
    direccion.cliente = clienteId;
    const url = `${API_URL}`;
    const respuesta = await axios.post(url, direccion);
    return respuesta.data;
  },

  obtenerDireccionesDeCliente: async (clienteId) => {
    const url = `${API_URL}/clientes/${clienteId}/direcciones`;
    const respuesta = await axios.get(url);
    return respuesta.data;
  },

  obtenerDireccionDeClientePorId: async (clienteId, direccionId) => {
    const url = `${API_URL}/clientes/${clienteId}/direcciones/${direccionId}`;
    const respuesta = await axios.get(url);
    return respuesta.data;
  },

  actualizarDireccionDeCliente: async (clienteId, direccionId, direccion) => {
    const url = `${API_URL}/clientes/${clienteId}/direcciones/${direccionId}`;
    const respuesta = await axios.put(url, direccion);
    return respuesta.data;
  },

  eliminarDireccionDeCliente: async (clienteId, direccionId) => {
    const url = `${API_URL}/clientes/${clienteId}/direcciones/${direccionId}`;
    const respuesta = await axios.delete(url);
    return respuesta.data;
  },
};

export default DireccionService;