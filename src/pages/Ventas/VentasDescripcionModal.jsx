import { StatusBadge } from "../../components/ui/table";
import { formatearFecha, formatearNumero } from "../../utils/formatters";

const SectionHeader = ({ icon, title, count }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-gray-800 flex-1">{title}</h3>
    {count !== undefined && (
      <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">{count}</span>
    )}
  </div>
);

const InfoRow = ({ label, value, accent }) => (
  <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-xs text-gray-500 font-medium flex-shrink-0">{label}</span>
    <span className={`text-xs font-semibold text-right break-all ${accent || 'text-gray-800'}`}>{value}</span>
  </div>
);

const VentasDescripcionModal = ({ rowData, abonosVenta, detallesVenta, loading, onVerUnidades }) => {
  if (!rowData) return <p className="p-6 text-gray-500 text-center">No hay datos para mostrar</p>;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        <p className="text-gray-500 text-sm">Cargando información...</p>
      </div>
    );
  }

  const totalAbonado = abonosVenta.reduce((sum, a) => sum + parseFloat(a.monto_abonado || 0), 0);
  const saldo = Number(rowData.debe || 0);
  const total = Number(rowData.total || 0);
  const pctPagado = total > 0 ? Math.min(100, ((totalAbonado / total) * 100)) : 0;

  return (
    <div className="p-3 sm:p-5 space-y-4">

      {/* ── Información General ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <SectionHeader
          icon={<svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          title="Información General"
        />
        <div className="grid grid-cols-2 gap-x-4">
          <InfoRow label="ID Venta" value={`#${rowData.id}`} accent="text-indigo-700" />
          <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-100">
            <span className="text-xs text-gray-500 font-medium flex-shrink-0">Estado</span>
            <StatusBadge value={rowData.estado} dot />
          </div>
          <InfoRow label="Fecha Venta" value={formatearFecha(rowData.fecha_venta)} />
          <InfoRow label="Fecha Entrega" value={formatearFecha(rowData.fecha_entrega_estimada)} />
        </div>
      </div>

      {/* ── Cliente ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <SectionHeader
          icon={<svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          title="Cliente"
        />
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 font-bold text-sm">
              {(rowData.cliente?.nombre?.[0] || '?').toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">
              {rowData.cliente?.nombre || ''} {rowData.cliente?.apellido || ''}
            </p>
            <p className="text-xs text-gray-500 truncate">
              ID: {rowData.cliente?.identificacion || 'N/A'}
            </p>
          </div>
        </div>
        <InfoRow label="Total de ventas" value={rowData.cliente?.total_ventas || 0} />
      </div>

      {/* ── Detalles de Productos ───────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <SectionHeader
          icon={<svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
          title="Productos"
          count={detallesVenta.length}
        />

        {detallesVenta.length > 0 ? (
          <div className="space-y-3">
            {detallesVenta.map((detalle, index) => (
              <div key={detalle.id ?? index} className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                {detalle.producto ? (
                  <>
                    {/* Cabecera del producto */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {detalle.producto.tipo} — {detalle.producto.modelo}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {detalle.producto.categoria?.nombre || 'Sin categoría'}
                        </p>
                      </div>
                      <div className="flex-shrink-0 bg-green-50 border-2 border-green-200 rounded-xl px-3 py-1.5 text-center">
                        <p className="text-lg font-bold text-green-700 leading-none">{detalle.cantidad || 0}</p>
                        <p className="text-xs text-green-600 leading-none mt-0.5">uds.</p>
                      </div>
                    </div>

                    {/* Detalles del producto */}
                    <div className="grid grid-cols-2 gap-x-3 text-xs mb-2">
                      {detalle.producto.colorPrincipal && (
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="text-gray-400">Color:</span>
                          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-medium truncate">
                            {detalle.producto.colorPrincipal}
                          </span>
                        </div>
                      )}
                      {detalle.producto.colorTejido && (
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="text-gray-400">Tejido:</span>
                          <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-medium truncate">
                            {detalle.producto.colorTejido}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="text-gray-400">Precio:</span>
                        <span className="text-indigo-700 font-bold">${formatearNumero(detalle.producto.precio || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="text-gray-400">Subtotal:</span>
                        <span className="text-indigo-700 font-bold">
                          ${formatearNumero((detalle.producto.precio || 0) * (detalle.cantidad || 0))}
                        </span>
                      </div>
                    </div>

                    {detalle.producto.observaciones && detalle.producto.observaciones !== 'No hay Observaciones' && (
                      <p className="text-xs text-gray-500 italic border-t border-gray-200 pt-2 mb-2">
                        {detalle.producto.observaciones}
                      </p>
                    )}

                    <button
                      onClick={() => onVerUnidades(detalle.producto.id, detalle.producto, detalle.id, detalle.venta)}
                      className="w-full mt-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 active:bg-indigo-200 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      Ver unidades vendidas
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-3">
                    Producto no disponible · ID #{detalle.producto_id || 'N/A'}
                  </p>
                )}
              </div>
            ))}

            {/* Total unidades */}
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <span className="text-sm font-semibold text-gray-700">Total de unidades</span>
              <span className="text-xl font-bold text-green-700">
                {detallesVenta.reduce((sum, d) => sum + (d.cantidad || 0), 0)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic text-center py-6 border border-dashed border-gray-200 rounded-xl">
            No hay productos registrados
          </p>
        )}
      </div>

      {/* ── Historial de Abonos ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <SectionHeader
          icon={<svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          title="Historial de Abonos"
          count={abonosVenta.length}
        />

        {abonosVenta.length > 0 ? (
          <div className="space-y-2">
            {abonosVenta.map((abono, index) => (
              <div key={index} className="bg-gray-50 rounded-xl border border-gray-100 p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-bold text-green-700">${formatearNumero(abono.monto_abonado)}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatearFecha(abono.fecha_abono)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {abono.metodo_pago && (
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
                        {abono.metodo_pago}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">#{abono.id}</span>
                  </div>
                  {abono.comentario && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{abono.comentario}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <span className="text-sm font-semibold text-gray-700">Total abonado</span>
              <span className="text-lg font-bold text-green-700">${formatearNumero(totalAbonado)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic text-center py-6 border border-dashed border-gray-200 rounded-xl">
            Sin abonos registrados
          </p>
        )}
      </div>

      {/* ── Resumen Financiero ───────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200 p-4 shadow-sm">
        <SectionHeader
          icon={<svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          title="Resumen Financiero"
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">Total de la venta</span>
            <span className="text-sm font-bold text-indigo-700">${formatearNumero(total)}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">Total abonado</span>
            <span className="text-sm font-bold text-green-600">${formatearNumero(totalAbonado)}</span>
          </div>

          {/* Barra de progreso */}
          <div className="py-1">
            <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-gray-200">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pctPagado}%`,
                  background: pctPagado >= 100 ? '#16a34a' : '#6366f1',
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">{pctPagado.toFixed(1)}% pagado</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t-2 border-indigo-200">
            <span className="text-base font-bold text-gray-800">Saldo pendiente</span>
            <span className={`text-xl font-extrabold ${saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${formatearNumero(saldo)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Comentarios ─────────────────────────────────── */}
      {rowData.comentarios?.trim() && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <SectionHeader
            icon={<svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>}
            title="Comentarios"
          />
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{rowData.comentarios}</p>
        </div>
      )}
    </div>
  );
};

export default VentasDescripcionModal;
