import { useState, useEffect, useRef } from 'react';
import UnidadProductoService from '../../services/UnidadProductoService';

function getPrincipalImage(imagenes) {
  return imagenes?.find(i => i.es_principal)?.imagen || imagenes?.[0]?.imagen || null;
}

const IconBox = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const IconGear = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

function Thumbnail({ src, alt, FallbackIcon }) {
  return (
    <div className="w-11 h-11 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50 flex items-center justify-center">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <FallbackIcon />
      )}
    </div>
  );
}

function PlantillaDropdown({ productos, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = productos.filter(p => {
    const q = search.toLowerCase();
    return (
      p.tipo?.toLowerCase().includes(q) ||
      p.modelo?.toLowerCase().includes(q) ||
      p.categoria?.nombre?.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-left"
      >
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-sm text-gray-500">Buscar y seleccionar plantilla...</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl mt-1.5 flex flex-col" style={{ maxHeight: '320px' }}>
          <div className="p-2.5 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por tipo, modelo o categoría..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">Sin resultados</div>
            ) : (
              filtered.map(product => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => { onSelect(product); setOpen(false); setSearch(''); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 active:bg-indigo-100 text-left transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <Thumbnail src={getPrincipalImage(product.imagenes)} alt={product.tipo} FallbackIcon={IconBox} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {product.tipo} — {product.modelo}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 truncate">{product.categoria?.nombre || 'Sin categoría'}</span>
                      <span className="text-xs font-bold text-indigo-600 flex-shrink-0">${Number(product.precio).toFixed(2)}</span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-indigo-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UnidadDropdown({ unidades, onSelect, loading }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = unidades.filter(u => {
    const q = search.toLowerCase();
    return (
      u.numeroSerie?.toLowerCase().includes(q) ||
      u.producto?.tipo?.toLowerCase().includes(q) ||
      u.producto?.modelo?.toLowerCase().includes(q) ||
      u.producto?.categoria?.nombre?.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => !loading && setOpen(v => !v)}
        disabled={loading}
        className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-sm text-gray-500">
          {loading ? 'Cargando unidades disponibles...' : 'Buscar unidad específica...'}
        </span>
        {loading ? (
          <svg className="animate-spin w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl mt-1.5 flex flex-col" style={{ maxHeight: '320px' }}>
          <div className="p-2.5 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por serie, tipo o modelo..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No hay unidades disponibles</div>
            ) : (
              filtered.map(unidad => (
                <button
                  key={unidad.id}
                  type="button"
                  onClick={() => { onSelect(unidad); setOpen(false); setSearch(''); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-green-50 active:bg-green-100 text-left transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <Thumbnail src={getPrincipalImage(unidad.producto?.imagenes)} alt={unidad.producto?.tipo} FallbackIcon={IconGear} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold font-mono text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                        {unidad.numeroSerie || 'S/N'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {unidad.producto?.tipo} — {unidad.producto?.modelo}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 truncate">{unidad.producto?.categoria?.nombre || 'Sin categoría'}</span>
                      <span className="text-xs font-bold text-green-600 flex-shrink-0">${Number(unidad.producto?.precio || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function VentasFormSelector({ productos = [], onAddProduct, refreshTrigger }) {
  const [tipoSeleccion, setTipoSeleccion] = useState('plantilla');
  const [unidadesDisponibles, setUnidadesDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tipoSeleccion === 'unidad') cargarUnidadesDisponibles();
  }, [tipoSeleccion, refreshTrigger]);

  const cargarUnidadesDisponibles = async () => {
    setLoading(true);
    try {
      const todas = await UnidadProductoService.getAllUnidadProductos();
      setUnidadesDisponibles(todas.filter(u => u.estado === 'disponible'));
    } catch (error) {
      console.error('❌ Error cargando unidades:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
        <button
          type="button"
          onClick={() => setTipoSeleccion('plantilla')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
            tipoSeleccion === 'plantilla'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span>Plantilla</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
            tipoSeleccion === 'plantilla' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
          }`}>{productos.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setTipoSeleccion('unidad')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
            tipoSeleccion === 'unidad'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
          <span>Unidad</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
            tipoSeleccion === 'unidad' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
          }`}>{loading ? '...' : unidadesDisponibles.length}</span>
        </button>
      </div>

      <p className="text-xs text-gray-400 px-1">
        {tipoSeleccion === 'plantilla'
          ? 'Agrega productos por tipo. Puedes ajustar la cantidad después.'
          : 'Selecciona un apero con número de serie específico (cantidad fija: 1).'}
      </p>

      {tipoSeleccion === 'plantilla' ? (
        <PlantillaDropdown
          productos={productos}
          onSelect={p => onAddProduct(p.id, 'plantilla', p)}
        />
      ) : (
        <UnidadDropdown
          unidades={unidadesDisponibles}
          onSelect={u => onAddProduct(u.id, 'unidad', u)}
          loading={loading}
        />
      )}
    </div>
  );
}

export default VentasFormSelector;
