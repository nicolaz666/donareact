import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import DireccionService from '../services/DireccionService';

const DireccionForm = ({ clienteId, mostrarModal, cargarClientes }) => {
  const [destinatario, setDestinatario] = useState('');
  const [celular, setCelular] = useState('');
  const [pais, setPais] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [nomenclatura, setNomenclatura] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await DireccionService.agregarDireccion(clienteId, { destinatario, celular, pais, departamento, ciudad, nomenclatura });
      await cargarClientes();
      setDestinatario(''); setCelular(''); setPais(''); setDepartamento(''); setCiudad(''); setNomenclatura('');
      mostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="df-destinatario" className="block text-900 font-medium mb-2">Destinatario</label>
      <InputText id="df-destinatario" type="text" placeholder="Destinatario" value={destinatario} onChange={e => setDestinatario(e.target.value)} className="w-full mb-3" />

      <label htmlFor="df-celular" className="block text-900 font-medium mb-2">Celular</label>
      <InputText id="df-celular" type="text" placeholder="Celular" value={celular} onChange={e => setCelular(e.target.value)} className="w-full mb-3" />

      <label htmlFor="df-pais" className="block text-900 font-medium mb-2">Pais</label>
      <InputText id="df-pais" type="text" placeholder="Pais" value={pais} onChange={e => setPais(e.target.value)} className="w-full mb-3" />

      <label htmlFor="df-departamento" className="block text-900 font-medium mb-2">Departamento</label>
      <InputText id="df-departamento" type="text" placeholder="Departamento" value={departamento} onChange={e => setDepartamento(e.target.value)} className="w-full mb-3" />

      <label htmlFor="df-ciudad" className="block text-900 font-medium mb-2">Ciudad</label>
      <InputText id="df-ciudad" type="text" placeholder="Ciudad" value={ciudad} onChange={e => setCiudad(e.target.value)} className="w-full mb-3" />

      <label htmlFor="df-nomenclatura" className="block text-900 font-medium mb-2">Nomenclatura</label>
      <InputText id="df-nomenclatura" type="text" placeholder="Nomenclatura" value={nomenclatura} onChange={e => setNomenclatura(e.target.value)} className="w-full mb-3" />

      <Button type="submit" label="Registrar" className="p-mt-2" />
    </form>
  );
};

export default DireccionForm;
