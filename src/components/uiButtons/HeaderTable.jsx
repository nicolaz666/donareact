// React import not required with the new JSX transform
import { Button } from 'primereact/button';

const HeaderTable = (props)=>{

  const mostrarModal = () =>{
    props.mostrarModal(true)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xl text-900 font-bold">{props.nombre}</span>
        <Button label={`Agregar ${props.nombre}`} size='small' severity='success' onClick={mostrarModal}  />
    </div>
  )
}

export default HeaderTable;