import axios from 'axios';

const baseUrl = 'http://localhost:8000/api/clientes/';

const ClienteService = {
  async getAllClientes() {
    const response = await axios.get(baseUrl);
    return response.data;
  },

  async crearCliente(cliente) {
    const response = await axios.post(baseUrl, cliente);
    return response.data;
  },

  async actualizarCliente(id, cliente) {
    const response = await axios.put(`${baseUrl}${id}/`, cliente);
    return response.data;
  },

  async eliminarCliente(id) {
    const response = await axios.delete(`${baseUrl}${id}/`);
    return response.data;
  },

  async getClienteById(id) {
    const response = await axios.get(`${baseUrl}${id}/`);
    return response.data;
  },
};

export default ClienteService;
