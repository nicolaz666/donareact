import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import ClienteService from '../services/ClienteService';

const ClienteForm = ({ mostrarModal, cargarClientes }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [identificacion, setIdentificacion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ClienteService.crearCliente({ nombre, apellido, identificacion });
      await cargarClientes();
      setNombre(''); setApellido(''); setIdentificacion('');
      mostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="cf-nombre" className="w-1/2 block text-900 font-medium mb-2">Nombre</label>
      <InputText id="cf-nombre" type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full mb-3" />

      <label htmlFor="cf-apellido" className="block text-900 font-medium mb-2">Apellido</label>
      <InputText id="cf-apellido" type="text" placeholder="Apellido" value={apellido} onChange={e => setApellido(e.target.value)} className="w-full mb-3" />

      <label htmlFor="cf-identificacion" className="block text-900 font-medium mb-2">Identificacion</label>
      <InputText id="cf-identificacion" type="text" placeholder="Identificacion" value={identificacion} onChange={e => setIdentificacion(e.target.value)} className="w-full mb-3" />

      <Button type="submit" label="Registrar" className="mt-4" />
    </form>
  );
};

export default ClienteForm;
