import { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import ClienteService from '../services/ClienteService';

const ClienteFormEdit = ({ rowData, mostrarModal, cargarClientes }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [identificacion, setIdentificacion] = useState('');

  useEffect(() => {
    if (rowData) {
      setNombre(rowData.nombre ?? '');
      setApellido(rowData.apellido ?? '');
      setIdentificacion(rowData.identificacion ?? '');
    }
  }, [rowData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ClienteService.actualizarCliente(rowData.id, { nombre, apellido, identificacion });
      await cargarClientes();
      mostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="cfe-nombre" className="w-1/2 block text-900 font-medium mb-2">Nombre</label>
      <InputText id="cfe-nombre" type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full mb-3" />

      <label htmlFor="cfe-apellido" className="block text-900 font-medium mb-2">Apellido</label>
      <InputText id="cfe-apellido" type="text" placeholder="Apellido" value={apellido} onChange={e => setApellido(e.target.value)} className="w-full mb-3" />

      <label htmlFor="cfe-identificacion" className="block text-900 font-medium mb-2">Identificacion</label>
      <InputText id="cfe-identificacion" type="text" placeholder="Identificacion" value={identificacion} onChange={e => setIdentificacion(e.target.value)} className="w-full mb-3" />

      <Button type="submit" label="Registrar Edicion" className="mt-4" />
    </form>
  );
};

export default ClienteFormEdit;
