import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import UnidadProductoService from '../../services/UnidadProductoService';

const UnidadProducto = ({ visible, onHide, producto }) => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible || !producto) return;

    const cargar = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Producto seleccionado:', producto);
        
        const data = await UnidadProductoService.getAllUnidadProductos();
        console.log('📦 Todas las unidades cargadas:', data);
        
        if (!data || data.length === 0) {
          console.warn('⚠️ No hay unidades en el sistema');
          setUnidades([]);
          return;
        }

        // Debuggear la primera unidad para ver su estructura
        console.log('🔬 Estructura de primera unidad:', data[0]);
        console.log('🔬 Tipo de u.producto:', typeof data[0].producto);
        console.log('🔬 Valor de u.producto:', data[0].producto);

        // Filtrar por producto - probando diferentes estructuras
        let filtradas;
        
        // Caso 1: producto es un objeto completo (nested object)
        if (data[0].producto && typeof data[0].producto === 'object' && data[0].producto.id) {
          filtradas = data.filter(u => Number(u.producto.id) === Number(producto.id));
          console.log('✅ Filtrando por objeto producto con ID');
        }
        // Caso 2: producto es un ID directo (número)
        else if (typeof data[0].producto === 'number') {
          filtradas = data.filter(u => Number(u.producto) === Number(producto.id));
          console.log('✅ Filtrando por ID directo');
        }
        // Caso 3: producto es un string con el ID
        else if (typeof data[0].producto === 'string') {
          filtradas = data.filter(u => Number(u.producto) === Number(producto.id));
          console.log('✅ Filtrando por string ID');
        }
        else {
          console.error('❌ Estructura de producto no reconocida');
          filtradas = [];
        }

        console.log(`📊 Unidades filtradas: ${filtradas.length} de ${data.length}`);
        console.log('📋 Unidades que coinciden:', filtradas);
        
        setUnidades(filtradas);
      } catch (err) {
        console.error('❌ Error cargando unidades:', err);
        setError(err.message || 'Error al cargar unidades');
        setUnidades([]);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [visible, producto]);

  const getEstadoBadge = (estado) => {
    const estados = {
      'disponible': { color: '#10b981', bg: '#d1fae5', label: 'Disponible' },
      'vendido': { color: '#ef4444', bg: '#fee2e2', label: 'Vendido' },
      'reservado': { color: '#f59e0b', bg: '#fef3c7', label: 'Reservado' },
      'mantenimiento': { color: '#6366f1', bg: '#e0e7ff', label: 'Mantenimiento' }
    };

    const config = estados[estado?.toLowerCase()] || { 
      color: '#6b7280', 
      bg: '#f3f4f6', 
      label: estado || 'Desconocido' 
    };

    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.875rem',
          fontWeight: '500',
          display: 'inline-block'
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <Dialog
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="pi pi-box" style={{ color: '#4f46e5' }}></i>
          {producto ? (
            <span>
              Unidades de: <strong>{producto.tipo} - {producto.modelo}</strong>
            </span>
          ) : (
            'Unidades del Producto'
          )}
        </div>
      }
      visible={visible}
      onHide={onHide}
      breakpoints={{'960px': '85vw','640px': '95vw'}}
      style={{ width: '70vw' }}
      contentStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
    >
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: '#4f46e5' }}></i>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando unidades...</p>
        </div>
      ) : error ? (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: '#fee2e2',
          borderRadius: '0.5rem',
          color: '#dc2626'
        }}>
          <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
          <p><strong>Error:</strong> {error}</p>
        </div>
      ) : unidades.length === 0 ? (
        <div style={{ 
          padding: '3rem', 
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem'
        }}>
          <i className="pi pi-inbox" style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: '1rem' }}></i>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            No hay unidades registradas para este producto
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {producto && `Producto ID: ${producto.id} - ${producto.tipo} ${producto.modelo}`}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            backgroundColor: '#eff6ff', 
            borderRadius: '0.5rem',
            borderLeft: '4px solid #4f46e5'
          }}>
            <p style={{ margin: 0, color: '#1e40af', fontSize: '0.875rem' }}>
              <strong>{unidades.length}</strong> unidad{unidades.length !== 1 ? 'es' : ''} encontrada{unidades.length !== 1 ? 's' : ''}
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
            <thead>
              <tr style={{ backgroundColor: '#4f46e5', color: 'white' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Número de Serie</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Fecha Creación</th>
              </tr>
            </thead>
            <tbody>
              {unidades.map((u, index) => (
                <tr 
                  key={u.id} 
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb'}
                >
                  <td style={{ 
                    padding: '1rem', 
                    border: '1px solid #e5e7eb',
                    fontWeight: '500',
                    color: '#4f46e5'
                  }}>
                    #{u.id}
                  </td>
                  <td style={{ 
                    padding: '1rem', 
                    border: '1px solid #e5e7eb',
                    fontFamily: 'monospace',
                    fontSize: '0.95rem'
                  }}>
                    {u.numeroSerie || <span style={{ color: '#9ca3af' }}>Sin número de serie</span>}
                  </td>
                  <td style={{ 
                    padding: '1rem', 
                    border: '1px solid #e5e7eb', 
                    textAlign: 'center' 
                  }}>
                    {getEstadoBadge(u.estado)}
                  </td>
                  <td style={{ 
                    padding: '1rem', 
                    border: '1px solid #e5e7eb',
                    color: '#6b7280'
                  }}>
                    {u.fechaCreacion ? new Date(u.fechaCreacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : <span style={{ color: '#9ca3af' }}>No disponible</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb'
      }}>
        <Button 
          label="Cerrar" 
          icon="pi pi-times"
          onClick={onHide}
          severity="secondary"
        />
      </div>
    </Dialog>
  );
};

export default UnidadProducto;