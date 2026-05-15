import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import {
  MapPin, Phone, Globe, Map, Home, User,
  Trash2, FileText, Plus, ChevronDown, ChevronUp,
} from 'lucide-react';
import DireccionService from '../services/DireccionService';

/* ── PDF export ─────────────────────────────────────── */
const exportarPDF = (dir, cliente) => {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dirección — ${dir.destinatario}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;padding:48px;color:#1a1a1a}
    .header{border-bottom:2px solid #1a1a1a;padding-bottom:16px;margin-bottom:32px}
    .brand{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#888;margin-bottom:6px}
    .title{font-size:22px;font-weight:700}
    .subtitle{font-size:13px;color:#666;margin-top:4px}
    .field{margin-bottom:20px}
    .label{font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.08em;margin-bottom:4px}
    .value{font-size:16px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
    .footer{margin-top:48px;padding-top:14px;border-top:1px solid #ddd;font-size:11px;color:#aaa}
    @media print{body{padding:24px}}
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Donacianocore</div>
    <div class="title">Dirección de Envío</div>
    <div class="subtitle">Cliente: ${cliente.nombre} ${cliente.apellido}</div>
  </div>
  <div class="field">
    <div class="label">Destinatario</div>
    <div class="value">${dir.destinatario}</div>
  </div>
  ${dir.celular ? `<div class="field"><div class="label">Celular</div><div class="value">${dir.celular}</div></div>` : ''}
  <div class="grid">
    <div class="field"><div class="label">País</div><div class="value">${dir.pais}</div></div>
    <div class="field"><div class="label">Departamento</div><div class="value">${dir.departamento}</div></div>
  </div>
  <div class="field"><div class="label">Ciudad</div><div class="value">${dir.ciudad}</div></div>
  <div class="field"><div class="label">Dirección / Nomenclatura</div><div class="value">${dir.nomenclatura}</div></div>
  <div class="footer">Generado el ${new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })}</div>
</body>
</html>`;
  const win = window.open('', '_blank', 'width=720,height=900');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
};

/* ── Formulario inline para nueva dirección ─────────── */
const REQUIRED = ['destinatario', 'pais', 'departamento', 'ciudad', 'nomenclatura'];
const EMPTY = { destinatario:'', celular:'', pais:'', departamento:'', ciudad:'', nomenclatura:'' };

const FormNuevaDireccion = ({ clienteId, onCreated, onCancel }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const validate = () => {
    const errs = {};
    REQUIRED.forEach(f => { if (!form[f].trim()) errs[f] = 'Requerido'; });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const creada = await DireccionService.agregarDireccion(clienteId, form);
      setForm(EMPTY);
      setErrors({});
      onCreated(creada);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ field, label, placeholder, icon: Icon }) => (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {Icon && <Icon size={12} className="text-slate-400" />} {label}
      </label>
      <InputText
        placeholder={placeholder}
        value={form[field]}
        onChange={set(field)}
        className={`w-full${errors[field] ? ' p-invalid' : ''}`}
      />
      {errors[field] && <span className="text-xs text-red-500">{errors[field]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}
      className="mt-4 border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col gap-3">
      <p className="text-sm font-semibold text-slate-700">Nueva dirección</p>

      <Field field="destinatario" label="Destinatario" placeholder="Nombre de quien recibe" icon={User} />
      <Field field="celular" label="Celular (opcional)" placeholder="Número de contacto" icon={Phone} />

      <div className="grid grid-cols-2 gap-3">
        <Field field="pais" label="País" placeholder="País" icon={Globe} />
        <Field field="departamento" label="Departamento" placeholder="Departamento" icon={Map} />
      </div>

      <Field field="ciudad" label="Ciudad" placeholder="Ciudad" icon={MapPin} />
      <Field field="nomenclatura" label="Dirección" placeholder="Ej: Cra 5 # 10-23" icon={Home} />

      <div className="flex justify-end gap-2 pt-1 border-t border-slate-200">
        <Button type="button" label="Cancelar" severity="secondary" outlined
          onClick={onCancel} disabled={saving} size="small" />
        <Button type="submit" label="Guardar" icon="pi pi-check"
          loading={saving} size="small" />
      </div>
    </form>
  );
};

/* ── Tarjeta de dirección ────────────────────────────── */
const DireccionCard = ({ dir, cliente, onDelete, deleting }) => (
  <div className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-colors">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600">
          <User size={15} />
        </span>
        <span className="font-semibold text-slate-800 text-sm">{dir.destinatario}</span>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => exportarPDF(dir, cliente)}
          title="Exportar PDF"
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium
            bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors">
          <FileText size={13} /> PDF
        </button>
        <button
          onClick={() => onDelete(dir.id)}
          disabled={deleting}
          title="Eliminar"
          className="flex items-center justify-center w-8 h-8 rounded-lg
            bg-red-50 text-red-500 border border-red-100 hover:bg-red-100
            disabled:opacity-40 transition-colors">
          {deleting ? <span className="animate-spin text-xs">⋯</span> : <Trash2 size={14} />}
        </button>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {dir.celular && (
        <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
          <Phone size={13} className="text-slate-400 shrink-0" />
          {dir.celular}
        </div>
      )}
      <div className="flex items-center gap-1.5 text-slate-600">
        <Globe size={13} className="text-slate-400 shrink-0" />
        {dir.pais}
      </div>
      <div className="flex items-center gap-1.5 text-slate-600">
        <Map size={13} className="text-slate-400 shrink-0" />
        {dir.departamento}
      </div>
      <div className="flex items-center gap-1.5 text-slate-600">
        <MapPin size={13} className="text-slate-400 shrink-0" />
        {dir.ciudad}
      </div>
      <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
        <Home size={13} className="text-slate-400 shrink-0" />
        {dir.nomenclatura}
      </div>
    </div>
  </div>
);

/* ── Modal principal ─────────────────────────────────── */
const DireccionesModal = ({ visible, onHide, cliente, onUpdate }) => {
  const [direcciones, setDirecciones] = useState([]);
  const [agregando, setAgregando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    setDirecciones(cliente?.direcciones ?? []);
    setAgregando(false);
  }, [cliente]);

  const handleDelete = async (id) => {
    setEliminandoId(id);
    try {
      await DireccionService.eliminarDireccion(id);
      setDirecciones(prev => prev.filter(d => d.id !== id));
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setEliminandoId(null);
    }
  };

  const handleCreated = (nuevaDireccion) => {
    setDirecciones(prev => [...prev, nuevaDireccion]);
    setAgregando(false);
    onUpdate();
  };

  if (!cliente) return null;

  const nombre = `${cliente.nombre} ${cliente.apellido}`;

  const header = (
    <div className="flex items-center gap-2">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600">
        <MapPin size={16} />
      </span>
      <div>
        <p className="font-semibold text-slate-800 text-base leading-tight">{nombre}</p>
        <p className="text-xs text-slate-400 font-normal">
          {direcciones.length === 0
            ? 'Sin direcciones'
            : `${direcciones.length} dirección${direcciones.length > 1 ? 'es' : ''}`}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog
      header={header}
      visible={visible}
      onHide={onHide}
      breakpoints={{ '960px': '80vw', '640px': '95vw' }}
      style={{ width: '520px' }}
      contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      modal
      dismissableMask
    >
      <div className="flex flex-col gap-3 pb-2">

        {/* Lista de direcciones */}
        {direcciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <MapPin size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Este cliente no tiene direcciones</p>
          </div>
        ) : (
          direcciones.map(dir => (
            <DireccionCard
              key={dir.id}
              dir={dir}
              cliente={cliente}
              onDelete={handleDelete}
              deleting={eliminandoId === dir.id}
            />
          ))
        )}

        {/* Botón / formulario agregar */}
        {!agregando ? (
          <button
            onClick={() => setAgregando(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
              border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500
              hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Plus size={15} /> Agregar dirección
          </button>
        ) : (
          <FormNuevaDireccion
            clienteId={cliente.id}
            onCreated={handleCreated}
            onCancel={() => setAgregando(false)}
          />
        )}

      </div>
    </Dialog>
  );
};

export default DireccionesModal;
