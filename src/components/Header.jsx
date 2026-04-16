import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Sidebar } from 'primereact/sidebar'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import Menu from './Menu'
import AuthService from '../services/AuthService'

export default function Header() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const user = AuthService.getCurrentUser()

  /**
   * Maneja el cierre de sesión con confirmación
   */
  const handleLogout = () => {
    confirmDialog({
      message: '¿Estás seguro de que deseas cerrar sesión?',
      header: 'Confirmar Cierre de Sesión',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cerrar sesión',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => {
        console.log('🚪 Cerrando sesión...')
        
        // Cerrar sesión
        AuthService.logout()
        
        // Redirigir al login
        navigate('/login', { replace: true })
        
        console.log('✅ Sesión cerrada')
      },
      reject: () => {
        console.log('❌ Cierre de sesión cancelado')
      }
    })
  }

  return (
    <>
      {/* Dialog de confirmación */}
      <ConfirmDialog />

      <div className='flex p-4 border-b-4 border-indigo-400 justify-between items-center'>
        {/* Sidebar móvil */}
        <Sidebar
          visible={visible}
          onHide={() => setVisible(false)}
          style={{ padding: 0, width: "280px" }}
          pt={{
            root: { style: { padding: 0 } },
            header: { style: { display: "none" } },
            content: { style: { padding: 0, height: "100%", overflow: "hidden" } },
          }}
        >
          <Menu
            variant="mobile"
            onNavigate={() => setVisible(false)}
          />
        </Sidebar>

        {/* Botón menú hamburguesa (solo móvil) */}
        <div className='md:hidden'>
          <Button 
            icon="pi pi-bars" 
            style={{ fontSize: '1.5rem' }} 
            onClick={() => setVisible(true)} 
            text
            aria-label="Abrir menú"
          />
        </div>

        {/* Información del usuario y botón de cerrar sesión */}
        <div className='flex items-center gap-4 ml-auto'>
          {/* Mostrar nombre de usuario */}
          {user && (
            <div className='hidden sm:flex items-center gap-2'>
              <div className='flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold'>
                {user.user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className='text-sm font-medium text-gray-700'>
                {user.user?.username || 'Usuario'}
              </span>
            </div>
          )}

          {/* Botón cerrar sesión */}
          <Button 
            label="CERRAR SESIÓN" 
            icon="pi pi-sign-out"
            size="small" 
            severity="danger" 
            outlined 
            onClick={handleLogout}
            tooltip="Cerrar sesión"
            tooltipOptions={{ position: 'bottom' }}
          />
        </div>
      </div>
    </>
  )
}