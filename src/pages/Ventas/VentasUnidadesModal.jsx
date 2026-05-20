import { StatusBadge } from "../../components/ui/table";
import { formatearFecha } from "../../utils/formatters";

const VentasUnidadesModal = ({ productoSeleccionado, unidadesProducto, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        <p className="text-gray-500 text-sm">Cargando unidades...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 space-y-4">
      {/* Info del producto */}
      {productoSeleccionado && (
        <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-blue-900 text-sm truncate">
              {productoSeleccionado.tipo} — {productoSeleccionado.modelo}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-blue-600">#{productoSeleccionado.id}</span>
              {productoSeleccionado.colorPrincipal && (
                <span className="text-xs bg-white border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded">
                  {productoSeleccionado.colorPrincipal}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {unidadesProducto.length > 0 ? (
        <>
          <div className="space-y-2">
            {unidadesProducto.map((unidad, index) => (
              <div
                key={unidad.id ?? unidad.numeroSerie ?? index}
                className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-700 text-xs font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-gray-900 text-sm truncate">
                    {unidad.numeroSerie || 'Sin serie'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Creado: {formatearFecha(unidad.fechaCreacion)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge value={unidad.estado} dot />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-gray-700">Total de unidades</span>
            <span className="text-xl font-bold text-blue-700">{unidadesProducto.length}</span>
          </div>
        </>
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm text-gray-400 italic">No hay unidades registradas para este producto</p>
        </div>
      )}
    </div>
  );
};

export default VentasUnidadesModal;
