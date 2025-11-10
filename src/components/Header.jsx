import { useState } from 'react'
import { Button } from 'primereact/button'
import { Sidebar } from 'primereact/sidebar';
import Menu from './Menu'

export default function Header() {

  const [visible, setVisible] = useState(false);

  return (
    <div className='flex p-4 border-b-4 border-indigo-400 justify-between items-center  '>
      <Sidebar visible={visible} onHide={() => setVisible(false)}>
        <Menu/>
      </Sidebar>
      <div className='md:hidden'>
        <Button icon="pi pi-bars" style={{ fontSize: '1.5rem' }} onClick={() => setVisible(true)} text/>
      </div>
      <div>
        <Button label="CERRAR SESION" size="small" severity="danger" outlined />
      </div>
    </div>
  )
}
