
import React from 'react';
import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import ClienteService from '../services/ClienteService';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import DireccionService from '../services/DireccionService';



const Clientes = () => {

  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [destinatario, setDestinatario] = useState('');
  const [celular, setCelular] = useState('');
  const [pais, setPais] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [nomenclatura, setNomenclatura] = useState('');

  // editar cliente

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);


  const [displayModal, setDisplayModal] = useState(false);
  const [displayModalClientes, setDisplayModalClientes] = useState(false);
  const [displayModalEditarlClientes, setDisplayModalEditarlClientes] = useState(false);

  const [displayModalDirecciones, setDisplayModalDirecciones] = useState(false);
  const [direccionesSeleccionadas, setDireccionesSeleccionadas] = useState([]);

  useEffect(() => {
    const cargarClientes = async () => {
      const response = await ClienteService.getAllClientes();
      setClientes(response);
    };
    cargarClientes();
  }, []);


  // LOGICA MODALES

  const abrirModalEditarlClientes = (rowData) =>{
    setDisplayModalEditarlClientes(true);
    setClienteSeleccionado(rowData);
    setNombre(rowData.nombre);
    setApellido(rowData.apellido);
    setIdentificacion(rowData.identificacion);

  }

  const abrirModalAgregarCliente = ()=>{
    setNombre('');
    setApellido('');
    setIdentificacion('');
    setDisplayModalClientes(true);
  }

  const abrirModalAgregarDirecciones = (cliente)=>{

    setDisplayModalDirecciones(true);
    setClienteSeleccionado(cliente);
  }

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xl text-900 font-bold">Clientes</span>
        <Button label='Agregar Cliente' size='small' severity='success'  onClick={()=> abrirModalAgregarCliente()}/>
    </div>
  );

  const abrirModalDirecciones = (rowData) => {
    setDireccionesSeleccionadas(rowData.direcciones);
    setDisplayModal(true);
  };


  const contenidoModalDirecciones = () => {
    return direccionesSeleccionadas.map((direccion, index) => (
        <div key={index} className="flex justify-center items-center">
          <div className='border-solid p-4 w-64 border-2 border-indigo-700 m-2 rounded'>
            <h4><strong>Destinatario:&nbsp;&nbsp;</strong>  {direccion.destinatario}</h4>
            <h4><strong>Celular:&nbsp;&nbsp;</strong>  {direccion.celular}</h4>
            <h4><strong>País:&nbsp;&nbsp;</strong>  {direccion.pais}</h4>
            <h4><strong>Departamento: &nbsp;&nbsp;</strong> {direccion.departamento}</h4>
            <h4><strong>Ciudad: &nbsp;&nbsp;</strong> {direccion.ciudad}</h4>
            <h4><strong>Nomenclatura:&nbsp;&nbsp;</strong>  {direccion.nomenclatura}</h4>
          </div>
        </div>
    ));
  };


  const modalAgregarCliente = ()=>{
     return (
      <div>
        <div >
          <form onSubmit={handleSubmit}>
            <label htmlFor="Nombre" className="w-1/2 block text-900 font-medium mb-2">Nombre</label>
            <InputText id="Nombre" type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full mb-3" />

            <label htmlFor="Apellido" className="block text-900 font-medium mb-2">Apellido</label>
            <InputText id="Apellido" type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full mb-3" />

            <label htmlFor="Identificacion" className="block text-900 font-medium mb-2">Identificacion</label>
            <InputText id="Identificacion" type="text" placeholder="Identificacion" value={identificacion} onChange={(e) => setIdentificacion(e.target.value)} className="w-full mb-3" />

            <Button type="submit" label="Registrar" className="mt-4" />
          </form>
        </div>
     </div>
     )
  }

  const modalEditarCliente = ()=>{
    return (
     <div>
       <div >
         <form onSubmit={handleEditarCliente}>
           <label htmlFor="Nombre" className="w-1/2 block text-900 font-medium mb-2">Nombre</label>
           <InputText id="Nombre" type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full mb-3" />

           <label htmlFor="Apellido" className="block text-900 font-medium mb-2">Apellido</label>
           <InputText id="Apellido" type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full mb-3" />

           <label htmlFor="Identificacion" className="block text-900 font-medium mb-2">Identificacion</label>
           <InputText id="Identificacion" type="text" placeholder="Identificacion" value={identificacion} onChange={(e) => setIdentificacion(e.target.value)} className="w-full mb-3" />

           <Button type="submit" label="Registrar Edicion" className="mt-4" />
         </form>
       </div>
    </div>
    )
 }

 const modalAgregarDirecciones = ()=>{
  return <>
    <form onSubmit={handleAgregarDireccion}>
      <label htmlFor="Destinatario" className="block text-900 font-medium mb-2">Destinatario</label>
      <InputText id="Destinatario" type="text" placeholder="Destinatario" value={destinatario} onChange={(e) => setDestinatario(e.target.value)} className="w-full mb-3" />

      <label htmlFor="Celular" className="block text-900 font-medium mb-2">Celular</label>
      <InputText id="Celular" type="text" placeholder="Celular" value={celular} onChange={(e) => setCelular(e.target.value)} className="w-full mb-3" />

      <label htmlFor="Pais" className="block text-900 font-medium mb-2">Pais</label>
      <InputText id="Pais" type="text" placeholder="Pais" value={pais} onChange={(e) => setPais(e.target.value)} className="w-full mb-3" />

      <label htmlFor="Departamento" className="block text-900 font-medium mb-2">Departamento</label>
      <InputText id="Departamento" type="text" placeholder="Departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} className="w-full mb-3" />

      <label htmlFor="Ciudad" className="block text-900 font-medium mb-2">Ciudad</label>
      <InputText id="Ciudad" type="text" placeholder="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="w-full mb-3" />

      <label htmlFor="Nomenclatura" className="block text-900 font-medium mb-2">Nomenclatura</label>
      <InputText id="Nomenclatura" type="text" placeholder="Nomenclatura" value={nomenclatura} onChange={(e) => setNomenclatura(e.target.value)} className="w-full mb-3" />

      <Button type="submit" label="Registrar" className="p-mt-2" />
    </form>
  </>
}

  //

  const renderButton = (rowData) =>{
    return (
      <div className='flex '>
        <div className='mx-4'>
          {rowData.direcciones.length > 0 ?
            (<Button
              label="Ver direcciones"
              icon="pi pi-eye"
              className="p-button-warning"
              size='small'
              onClick={() => abrirModalDirecciones(rowData)}
            />
            )
            :
            <span>Sin direcciones</span>
          }
        </div>
        <div>
          <Button icon="pi pi-plus" onClick={()=> abrirModalAgregarDirecciones(rowData)} size='small' rounded severity="success" aria-label="Search" />
        </div>
      </div>
    )
  }

  const renderAcciones = (rowData)=>{
    return (
      <div className='flex items-center justify-center'>
      <Button icon="pi pi-pen-to-square" className='mx-2' severity="warning" aria-label="Editar" size='small' onClick={() => abrirModalEditarlClientes(rowData)} />
      <Button icon="pi pi-times" className='mx-2' severity="danger" aria-label="Eliminar" size='small' onClick={() => eliminarCliente(rowData.id)} />
    </div>
    )
  }

  // ---- FIN LOGICA MODALES ----

  // CREAR CLIENTE
  const handleSubmit = async (event)=>{

    event.preventDefault();

    const cliente = {
      nombre: nombre,
      apellido: apellido,
      identificacion: identificacion,
      // Agrega aquí cualquier otro campo que necesites
    };

    try {
      const respuesta = await ClienteService.crearCliente(cliente);
      console.log(respuesta);
      // Recarga la lista de clientes después de crear uno nuevo
      const cargarClientes = async () => {
        const response = await ClienteService.getAllClientes();
        setClientes(response);
        console.log(response)
      };
      cargarClientes();
      // Limpiar los campos del formulario después de crear el cliente
      setNombre('');
      setApellido('');
      setIdentificacion('');
      // ...
      setDisplayModalClientes(false); // Cierra el modal después de crear el cliente
    } catch (error) {
      console.error(error);
    }
  }

  // editar cliente logica

  const handleEditarCliente = async (event) => {

    event.preventDefault();

    const cliente = {
      nombre: nombre,
      apellido: apellido,
      identificacion: identificacion,
    };

    try {
      const respuesta = await ClienteService.actualizarCliente(clienteSeleccionado.id, cliente);
      console.log(respuesta);
      const cargarClientes = async () => {
        const response = await ClienteService.getAllClientes();
        setClientes(response);
      };
      cargarClientes();
      // Limpiar los campos del formulario después de crear el cliente

      setDisplayModalEditarlClientes(false);
    } catch (error) {
      console.error(error);
    }

    // Resto del código...
  };

  //eliminar clientes

  const eliminarCliente = async (id) => {
    try {
      const respuesta = await ClienteService.eliminarCliente(id);
      console.log(respuesta);
      const cargarClientes = async () => {
        const response = await ClienteService.getAllClientes();
        setClientes(response);
      };
      cargarClientes();
    } catch (error) {
      console.error(error);
    }
  };


// LOGICA CREAR DIRECCIONES


  const handleAgregarDireccion = async (event)=>{
    event.preventDefault();

  const direccion = {
    destinatario: destinatario,
    celular: celular,
    pais: pais,
    departamento: departamento,
    ciudad: ciudad,
    nomenclatura: nomenclatura,
  };

  try {
    const respuesta = await DireccionService.agregarDireccion(clienteSeleccionado.id, direccion);
    console.log(respuesta);
    // Recarga la lista de clientes después de agregar una dirección
    const cargarClientes = async () => {
      const response = await ClienteService.getAllClientes();
      setClientes(response);
    };
    cargarClientes();
    // Limpiar los campos del formulario después de agregar la dirección
    setDestinatario('');
    setCelular('');
    setPais('');
    setDepartamento('');
    setCiudad('');
    setNomenclatura('');
    setDisplayModalDirecciones(false); // Cierra el modal después de agregar la dirección
  } catch (error) {
    console.error(error);
  }

  }

  return (
    <div className='card'>
      <DataTable value={clientes} paginator rows={5}  header={header} resizableColumns showGridlines tableStyle={{ minWidth: '50rem' }}>
        <Column field="id" header="ID" />
        <Column field="nombre" header="Nombre" />
        <Column field="apellido" header="Apellido" />
        <Column field="total_ventas" header="Total Ventas" />
        <Column
          header="Direcciones"
          body={renderButton}

        />
        <Column header="Acciones"   body={renderAcciones} />
      </DataTable>

      <Dialog
        header="Direcciones"
        visible={displayModal}
        onHide={() => setDisplayModal(false)}
        breakpoints={{'960px': '75vw','640px': '90vw'}}
        style={{width: '30vw'}}
      >
        {contenidoModalDirecciones()}
      </Dialog>

      <Dialog
        header="Agregar Cliente"
        visible={displayModalClientes}
        onHide={() => setDisplayModalClientes(false)}
        breakpoints={{'960px': '75vw','640px': '90vw'}}
        style={{width: '50vw'}}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {modalAgregarCliente()}
      </Dialog>

      <Dialog
        header="Editar Cliente"
        visible={displayModalEditarlClientes}
        onHide={() => setDisplayModalEditarlClientes(false)}
        breakpoints={{'960px': '75vw','640px': '90vw'}}
        style={{width: '50vw'}}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {modalEditarCliente()}
      </Dialog>

      <Dialog
        header="Agregar Direccion"
        visible={displayModalDirecciones}
        onHide={() => setDisplayModalDirecciones(false)}
        breakpoints={{'960px': '75vw','640px': '90vw'}}
        style={{width: '50vw'}}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {modalAgregarDirecciones()}
      </Dialog>
    </div>
  );
};

export default Clientes;