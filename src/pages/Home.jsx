import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

import VentasService from '../services/VentasService';
import ProductoService from '../services/ProductoService';
import detalleVentasService from '../services/detallleVentasService';

function Home() {
  // Estados para datos
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [detallesVentas, setDetallesVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para métricas calculadas
  const [ventasPorMes, setVentasPorMes] = useState([]);
  const [totalSaldoMes, setTotalSaldoMes] = useState(0);
  const [totalSaldoAcumulado, setTotalSaldoAcumulado] = useState(0);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [ventasPorEstado, setVentasPorEstado] = useState([]);

  /**
   * Carga todos los datos necesarios al montar el componente
   */
  useEffect(() => {
    cargarDatos();
  }, []);

  /**
   * Calcula todas las métricas cuando cambian los datos
   */
  useEffect(() => {
    if (ventas.length > 0) {
      calcularVentasPorMes();
      calcularSaldos();
      calcularVentasPorEstado();
    }
    if (detallesVentas.length > 0 && productos.length > 0) {
      calcularProductosMasVendidos();
    }
  }, [ventas, detallesVentas, productos]);

  /**
   * Carga todos los datos desde los servicios
   */
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [ventasData, productosData, detallesData] = await Promise.all([
        VentasService.getAllVentas(),
        ProductoService.getAllProductos(),
        detalleVentasService.getAllDetalleVentas()
      ]);

      setVentas(ventasData || []);
      setProductos(productosData || []);
      setDetallesVentas(detallesData || []);
      
      console.log('📊 Datos cargados:', { 
        ventas: ventasData?.length, 
        productos: productosData?.length,
        detalles: detallesData?.length 
      });
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula las ventas agrupadas por mes
   */
  const calcularVentasPorMes = () => {
    const ventasPorMesMap = {};
    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();

    // Inicializar los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(añoActual, mesActual - i, 1);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      
      ventasPorMesMap[key] = {
        mes: nombreMes,
        total: 0,
        saldo: 0,
        cantidad: 0
      };
    }

    // Sumar ventas por mes
    ventas.forEach(venta => {
      const fecha = new Date(venta.fecha_venta);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (ventasPorMesMap[key]) {
        ventasPorMesMap[key].total += Number(venta.total || 0);
        ventasPorMesMap[key].saldo += Number(venta.debe || 0);
        ventasPorMesMap[key].cantidad += 1;
      }
    });

    const resultado = Object.values(ventasPorMesMap);
    setVentasPorMes(resultado);
    console.log('📈 Ventas por mes:', resultado);
  };

  /**
   * Calcula el saldo del mes actual y el saldo acumulado total
   */
  const calcularSaldos = () => {
    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();
    
    let saldoMes = 0;
    let saldoTotal = 0;

    ventas.forEach(venta => {
      const fechaVenta = new Date(venta.fecha_venta);
      const saldo = Number(venta.debe || 0);
      
      // Saldo del mes actual
      if (fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === añoActual) {
        saldoMes += saldo;
      }
      
      // Saldo total acumulado
      saldoTotal += saldo;
    });

    setTotalSaldoMes(saldoMes);
    setTotalSaldoAcumulado(saldoTotal);
    
    console.log('💰 Saldos calculados:', { saldoMes, saldoTotal });
  };

  /**
   * Calcula los productos más vendidos por cantidad
   */
  const calcularProductosMasVendidos = () => {
    const cantidadPorProducto = {};

    detallesVentas.forEach(detalle => {
      const productoId = detalle.producto?.id || detalle.producto_id;
      const cantidad = Number(detalle.cantidad || 0);

      if (!cantidadPorProducto[productoId]) {
        const producto = productos.find(p => p.id === productoId);
        cantidadPorProducto[productoId] = {
          nombre: producto ? `${producto.tipo} - ${producto.modelo}` : `Producto ${productoId}`,
          cantidad: 0,
          colorPrincipal: producto?.colorPrincipal || 'N/A'
        };
      }

      cantidadPorProducto[productoId].cantidad += cantidad;
    });

    const resultado = Object.values(cantidadPorProducto)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10); // Top 10 productos

    setProductosMasVendidos(resultado);
    console.log('🏆 Productos más vendidos:', resultado);
  };

  /**
   * Calcula la distribución de ventas por estado
   */
  const calcularVentasPorEstado = () => {
    const estadosMap = {
      'pendiente': { nombre: 'Pendiente', cantidad: 0, color: '#3b82f6' },
      'en_proceso': { nombre: 'En Proceso', cantidad: 0, color: '#f59e0b' },
      'entregado': { nombre: 'Entregado', cantidad: 0, color: '#10b981' },
      'cancelado': { nombre: 'Cancelado', cantidad: 0, color: '#ef4444' }
    };

    ventas.forEach(venta => {
      const estado = venta.estado?.toLowerCase() || 'pendiente';
      if (estadosMap[estado]) {
        estadosMap[estado].cantidad += 1;
      }
    });

    const resultado = Object.values(estadosMap).filter(e => e.cantidad > 0);
    setVentasPorEstado(resultado);
  };

  /**
   * Formatea números a moneda
   */
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Colores para gráficos
  const COLORES_PIE = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error al cargar datos</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={cargarDatos}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Dashboard de Ventas
          </h1>
          <p className="text-gray-600 text-lg">
            Resumen general del sistema de gestión
          </p>
        </div>

        {/* Cards de Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Ventas */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Ventas</p>
                <p className="text-3xl font-bold text-gray-900">{ventas.length}</p>
                <p className="text-xs text-gray-400 mt-1">Registradas</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Saldo Mes Actual */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Saldo del Mes</p>
                <p className="text-2xl font-bold text-orange-600">{formatearMoneda(totalSaldoMes)}</p>
                <p className="text-xs text-gray-400 mt-1">Pendiente de cobro</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Saldo Total Acumulado */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Saldo Acumulado</p>
                <p className="text-2xl font-bold text-red-600">{formatearMoneda(totalSaldoAcumulado)}</p>
                <p className="text-xs text-gray-400 mt-1">Total por cobrar</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Productos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Productos</p>
                <p className="text-3xl font-bold text-gray-900">{productos.length}</p>
                <p className="text-xs text-gray-400 mt-1">En catálogo</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos en Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Ventas por Mes - Gráfico de Barras */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Ventas por Mes</h2>
              <span className="text-sm text-gray-500">Últimos 6 meses</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => formatearMoneda(value)}
                />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" name="Total Ventas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="saldo" fill="#f59e0b" name="Saldo Pendiente" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ventas por Estado - Gráfico de Pastel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Ventas por Estado</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ventasPorEstado}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nombre, cantidad, percent }) => 
                    `${nombre}: ${cantidad} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {ventasPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productos Más Vendidos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">🏆 Productos Más Vendidos</h2>
            <span className="text-sm text-gray-500">Top 10</span>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={productosMasVendidos} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis 
                type="category" 
                dataKey="nombre" 
                stroke="#6b7280" 
                width={100}
                style={{ fontSize: '11px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="cantidad" fill="#10b981" name="Unidades Vendidas" radius={[0, 8, 8, 0]}>
                {productosMasVendidos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES_PIE[index % COLORES_PIE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer con información adicional */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">Promedio por Venta</p>
              <p className="text-2xl font-bold text-indigo-600">
                {formatearMoneda(ventas.reduce((sum, v) => sum + Number(v.total || 0), 0) / (ventas.length || 1))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">Unidades Vendidas</p>
              <p className="text-2xl font-bold text-green-600">
                {detallesVentas.reduce((sum, d) => sum + Number(d.cantidad || 0), 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">Tasa de Cobro</p>
              <p className="text-2xl font-bold text-blue-600">
                {ventas.length > 0 
                  ? ((ventas.reduce((sum, v) => sum + (Number(v.total || 0) - Number(v.debe || 0)), 0) / 
                     ventas.reduce((sum, v) => sum + Number(v.total || 0), 0)) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;