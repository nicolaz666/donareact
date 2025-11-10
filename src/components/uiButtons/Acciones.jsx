// React import not required with the new JSX transform
import { Button } from 'primereact/button';


const Acciones = ({rowData,mostrarModal, setRowData, eliminar})=>{

  const modal = ()=>{
    mostrarModal(true)
    setRowData(rowData)
  }

  return (
    <div className='flex items-center justify-center'>
      <Button icon="pi pi-pen-to-square" className='mx-2' severity="warning" aria-label="Editar" size='small' onClick={() => modal()} />
      <Button icon="pi pi-times" className='mx-2' severity="danger" aria-label="Eliminar" size='small' onClick={() => eliminar(rowData.id)} />
    </div>
  )
}

export default Acciones;