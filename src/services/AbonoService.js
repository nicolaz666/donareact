import axios from "axios";

import { buildApiUrl } from "../config/api";

const baseUrl = buildApiUrl("abonos/");

const AbonoService = {

    async getAllAbonos(){
      const response = await axios.get(baseUrl);
      return response
    },

    async crearAbono(abono){
      const response = await axios.post(baseUrl, abono);
      return response.data;

    },
    async editarAbono(id, abono){
      const response = await axios.put(`${baseUrl}${id}/`, abono)
      return response.data;
    },
    async eliminarAbono(id){
      const response = await axios.delete(`${baseUrl}${id}/`)
      return response.data;
    },
    async getAbono(id){
      const response = await axios.get(`${baseUrl}${id}/`)
      return response.data
    }
}

export default AbonoService;