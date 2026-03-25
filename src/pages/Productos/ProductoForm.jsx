import { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ProductoService from '../../services/ProductoService';
import CategoriaService from '../../services/CategoriaService';
import GrupoImagenesService from '../../services/GrupoImagenesService';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const LIMITE_IMAGENES = 3;

const COLORES_CHOICES = [
  'Naranja','Negro','Roble','Crudo','Azul Celeste','Azul Rey',
  'Amarillo','Rojo','Rosado','Verde Claro','Verde Militar','Crudo Amarillo','Blanco Natural',
].map(c => ({ label: c, value: c }));

const TIPOS = ['Tejido','Rejo','Plano','Sencillo'].map(t => ({ label: t, value: t }));
const MODELOS = [
  { label: '4 Tornillos', value: '4 Tornillos' },
  { label: 'Clásico',     value: 'Clasico' },
  { label: 'Charol',      value: 'Charol' },
];
const COLORES_PRINCIPALES = [
  'Negro','Roble','Crudo','Chocolate','Envejecido',
].map(c => ({ label: c, value: c }));

/* ─────────────────────────────────────────────
   STEP CONFIG  (for the stepper header)
───────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Información',  icon: '◈' },
  { id: 2, label: 'Colores',      icon: '◉' },
  { id: 3, label: 'Imágenes',     icon: '◧' },
];

/* ─────────────────────────────────────────────
   REUSABLE PRIMITIVES
───────────────────────────────────────────── */

const css = String.raw;

const globalStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Cormorant+Garamond:wght@400;500;600&display=swap');

  .pf-root {
    --bg:        #ffffff;
    --surface:   #f8f8f8;
    --surface2:  #f3f3f3;
    --border:    #e0e0e0;
    --border-focus: #c9a96e;
    --text-main: #1a1a1a;
    --text-sub:  #555;
    --text-mute: #999;
    --gold:      #c9a96e;
    --gold-dim:  #8a6f3f;
    --gold-glow: rgba(201,169,110,0.18);
    --red:       #e05555;
    --green:     #56b87a;
    --radius:    10px;
    --transition: 0.22s cubic-bezier(0.4,0,0.2,1);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--text-main);
    background: var(--bg);
  }

  /* ── Stepper ── */
  .pf-stepper { display: flex; align-items: center; gap: 0; margin-bottom: 36px; }
  .pf-step {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    gap: 6px; cursor: default; position: relative;
  }
  .pf-step::after {
    content: ''; position: absolute; top: 18px; left: 50%; width: 100%;
    height: 1px; background: var(--border);
    transition: background var(--transition);
  }
  .pf-step:last-child::after { display: none; }
  .pf-step-dot {
    width: 36px; height: 36px; border-radius: 50%;
    border: 1.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: var(--text-mute);
    background: var(--surface); position: relative; z-index: 1;
    transition: all var(--transition);
  }
  .pf-step.active .pf-step-dot {
    border-color: var(--gold); color: var(--gold);
    box-shadow: 0 0 0 4px var(--gold-glow);
  }
  .pf-step.done .pf-step-dot {
    border-color: var(--gold); background: var(--gold); color: #0f0f0f;
  }
  .pf-step.done::after { background: var(--gold-dim); }
  .pf-step-label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-mute);
    transition: color var(--transition);
  }
  .pf-step.active .pf-step-label { color: var(--gold); }

  /* ── Section title ── */
  .pf-section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 500;
    color: var(--text-main); margin-bottom: 4px;
  }
  .pf-section-sub {
    font-size: 12px; color: var(--text-mute);
    letter-spacing: 0.05em; margin-bottom: 28px;
  }

  /* ── Field ── */
  .pf-field { display: flex; flex-direction: column; gap: 6px; }
  .pf-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-sub);
    display: flex; align-items: center; gap: 6px;
  }
  .pf-label-opt {
    font-size: 10px; font-weight: 400; color: var(--text-mute);
    text-transform: none; letter-spacing: 0;
  }

  /* ── Input / Select shared ── */
  .pf-input, .pf-select {
    width: 100%; background: var(--surface2);
    border: 1.5px solid var(--border); border-radius: var(--radius);
    padding: 11px 14px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text-main);
    outline: none; appearance: none; -webkit-appearance: none;
    transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
    box-sizing: border-box;
  }
  .pf-input::placeholder { color: var(--text-mute); }
  .pf-input:hover, .pf-select:hover { border-color: #444; }
  .pf-input:focus, .pf-select:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px var(--gold-glow);
    background: #fafafa;
  }
  .pf-input.error, .pf-select.error { border-color: var(--red); }
  .pf-input.error:focus, .pf-select.error:focus { box-shadow: 0 0 0 3px rgba(224,85,85,0.15); }

  /* select arrow */
  .pf-select-wrap { position: relative; }
  .pf-select-wrap::after {
    content: '⌄'; position: absolute; right: 14px; top: 50%;
    transform: translateY(-52%); pointer-events: none;
    color: var(--text-mute); font-size: 16px;
  }
  .pf-select option { background: #ffffff; color: #1a1a1a; }

  /* ── Input with icon ── */
  .pf-input-icon-wrap { position: relative; }
  .pf-input-icon-wrap .pf-input { padding-left: 40px; }
  .pf-input-icon {
    position: absolute; left: 13px; top: 50%;
    transform: translateY(-50%); color: var(--text-mute);
    font-size: 14px; pointer-events: none;
  }

  /* ── Error message ── */
  .pf-error {
    font-size: 11px; color: var(--red); display: flex;
    align-items: center; gap: 4px;
    animation: pf-slide-down 0.2s ease;
  }
  @keyframes pf-slide-down {
    from { opacity:0; transform: translateY(-4px); }
    to   { opacity:1; transform: translateY(0); }
  }

  /* ── Grid layouts ── */
  .pf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .pf-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  @media (max-width: 600px) {
    .pf-grid-2, .pf-grid-3 { grid-template-columns: 1fr; }
  }

  /* ── Divider ── */
  .pf-divider {
    border: none; border-top: 1px solid var(--border);
    margin: 28px 0;
  }

  /* ── Color chip selector ── */
  .pf-color-group {
    display: flex; flex-wrap: wrap; gap: 8px;
  }
  .pf-color-chip {
    padding: 6px 13px; border-radius: 999px;
    border: 1.5px solid var(--border); background: var(--surface2);
    font-size: 12px; font-weight: 500; color: var(--text-sub);
    cursor: pointer; transition: all var(--transition);
    white-space: nowrap;
  }
  .pf-color-chip:hover { border-color: #555; color: var(--text-main); }
  .pf-color-chip.selected {
    border-color: var(--gold); color: var(--gold);
    background: var(--gold-glow);
    box-shadow: 0 0 0 1px var(--gold-dim);
  }

  /* ── Image upload zone ── */
  .pf-dropzone {
    border: 1.5px dashed var(--border); border-radius: var(--radius);
    padding: 28px; text-align: center; cursor: pointer;
    transition: all var(--transition); background: var(--surface2);
  }
  .pf-dropzone:hover {
    border-color: var(--gold-dim); background: #fdf9f3;
  }
  .pf-dropzone-icon { font-size: 28px; margin-bottom: 8px; color: var(--text-mute); }
  .pf-dropzone-text { font-size: 13px; color: var(--text-sub); }
  .pf-dropzone-sub { font-size: 11px; color: var(--text-mute); margin-top: 4px; }

  .pf-image-grid { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px; }
  .pf-image-card {
    position: relative; width: 90px; height: 90px;
    border-radius: 8px; overflow: hidden;
    border: 1.5px solid var(--border);
    transition: border-color var(--transition), box-shadow var(--transition);
  }
  .pf-image-card.principal {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px var(--gold-glow);
  }
  .pf-image-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pf-image-overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    gap: 8px; opacity: 0; transition: opacity var(--transition);
  }
  .pf-image-card:hover .pf-image-overlay { opacity: 1; }
  .pf-image-action {
    width: 28px; height: 28px; border-radius: 50%; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 13px; transition: transform 0.15s;
  }
  .pf-image-action:hover { transform: scale(1.1); }
  .pf-image-action.star { background: var(--gold); color: #0f0f0f; }
  .pf-image-action.del  { background: var(--red); color: #fff; }
  .pf-badge-principal {
    position: absolute; top: -9px; left: 50%; transform: translateX(-50%);
    background: var(--gold); color: #0f0f0f; font-size: 9px; font-weight: 700;
    padding: 2px 8px; border-radius: 99px; white-space: nowrap; letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* ── Buttons ── */
  .pf-btn {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 8px; padding: 12px 24px; border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
    cursor: pointer; border: none; transition: all var(--transition);
  }
  .pf-btn-primary {
    background: var(--gold); color: #0f0f0f;
    box-shadow: 0 4px 24px var(--gold-glow);
  }
  .pf-btn-primary:hover:not(:disabled) {
    background: #d4b882; box-shadow: 0 6px 32px rgba(201,169,110,0.3);
    transform: translateY(-1px);
  }
  .pf-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .pf-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
  .pf-btn-ghost {
    background: transparent; color: var(--text-sub);
    border: 1.5px solid var(--border);
  }
  .pf-btn-ghost:hover { border-color: #555; color: var(--text-main); }
  .pf-btn-sm { padding: 8px 16px; font-size: 11px; }

  /* ── Nav buttons ── */
  .pf-nav { display: flex; justify-content: space-between; margin-top: 36px; gap: 12px; }

  /* ── Spinner ── */
  .pf-spinner {
    width: 16px; height: 16px; border: 2px solid rgba(15,15,15,0.3);
    border-top-color: #0f0f0f; border-radius: 50%;
    animation: pf-spin 0.7s linear infinite;
  }
  @keyframes pf-spin { to { transform: rotate(360deg); } }

  /* ── Textarea ── */
  .pf-textarea {
    resize: vertical; min-height: 80px;
  }

  /* ── Success toast ── */
  .pf-success-banner {
    background: rgba(86,184,122,0.12); border: 1px solid #56b87a44;
    border-radius: var(--radius); padding: 14px 18px;
    display: flex; align-items: center; gap: 10px;
    color: var(--green); font-size: 13px;
    animation: pf-slide-down 0.3s ease;
  }

  /* ── Scrollbar ── */
  .pf-root ::-webkit-scrollbar { width: 5px; }
  .pf-root ::-webkit-scrollbar-track { background: transparent; }
  .pf-root ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 99px; }
`;

/* ─────────────────────────────────────────────
   FIELD COMPONENT
───────────────────────────────────────────── */
const Field = ({ label, optional, error, children }) => (
  <div className="pf-field">
    <label className="pf-label">
      {label}
      {optional && <span className="pf-label-opt">(opcional)</span>}
    </label>
    {children}
    {error && <span className="pf-error">⚠ {error}</span>}
  </div>
);

/* ─────────────────────────────────────────────
   NATIVE SELECT COMPONENT
───────────────────────────────────────────── */
const Select = ({ value, onChange, options, placeholder, error, disabled }) => (
  <div className="pf-select-wrap">
    <select
      className={`pf-select${error ? ' error' : ''}`}
      value={value ?? ''}
      onChange={e => onChange(e.target.value || null)}
      disabled={disabled}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

/* ─────────────────────────────────────────────
   COLOR CHIP SELECTOR
───────────────────────────────────────────── */
const ColorChips = ({ options, value, onChange }) => (
  <div className="pf-color-group" role="group">
    {options.map(o => (
      <button
        key={o.value}
        type="button"
        className={`pf-color-chip${value === o.value ? ' selected' : ''}`}
        onClick={() => onChange(value === o.value ? null : o.value)}
        aria-pressed={value === o.value}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   STEP PANELS
───────────────────────────────────────────── */

/* Step 1: Información General */
const StepInfo = ({ state, set, errors, categoriaApi }) => {
  const s = state;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <p className="pf-section-title">Información General</p>
        <p className="pf-section-sub">Categoría, tipo, modelo y precio del producto</p>
      </div>

      <Field label="Categoría" error={errors.categoria_id}>
        <Select
          value={s.categoria_id} onChange={v => set('categoria_id', v)}
          options={categoriaApi} placeholder="Seleccione una categoría"
          error={errors.categoria_id}
        />
      </Field>

      <div className="pf-grid-2">
        <Field label="Tipo" error={errors.tipo}>
          <Select value={s.tipo} onChange={v => set('tipo', v)} options={TIPOS}
            placeholder="Seleccione un tipo" error={errors.tipo} />
        </Field>
        <Field label="Modelo" error={errors.modelo}>
          <Select value={s.modelo} onChange={v => set('modelo', v)} options={MODELOS}
            placeholder="Seleccione un modelo" error={errors.modelo} />
        </Field>
      </div>

      <Field label="Precio" error={errors.precio}>
        <div className="pf-input-icon-wrap">
          <span className="pf-input-icon">$</span>
          <input
            type="number" min="0" step="100"
            className={`pf-input${errors.precio ? ' error' : ''}`}
            placeholder="0"
            value={s.precio}
            onChange={e => set('precio', e.target.value)}
          />
        </div>
      </Field>

      <Field label="Observaciones" optional>
        <textarea
          className="pf-input pf-textarea"
          placeholder="Notas adicionales sobre el producto..."
          value={s.observaciones}
          onChange={e => set('observaciones', e.target.value)}
        />
      </Field>
    </div>
  );
};

/* Step 2: Colores */
const StepColores = ({ state, set, errors }) => {
  const s = state;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div>
        <p className="pf-section-title">Paleta de Colores</p>
        <p className="pf-section-sub">Selecciona los colores de cada componente del producto</p>
      </div>

      <Field label="Color Principal" error={errors.colorPrincipal}>
        <ColorChips options={COLORES_PRINCIPALES} value={s.colorPrincipal}
          onChange={v => set('colorPrincipal', v)} />
      </Field>

      <hr className="pf-divider" />

      <div className="pf-grid-2">
        <Field label="Color Tejido" error={errors.colorTejido}>
          <Select value={s.colorTejido} onChange={v => set('colorTejido', v)}
            options={COLORES_CHOICES} placeholder="Seleccionar" error={errors.colorTejido} />
        </Field>
        <Field label="Color Soga Rienda" error={errors.colorSogaRienda}>
          <Select value={s.colorSogaRienda} onChange={v => set('colorSogaRienda', v)}
            options={COLORES_CHOICES} placeholder="Seleccionar" error={errors.colorSogaRienda} />
        </Field>
        <Field label="Color Manzanos" error={errors.colorManzanos}>
          <Select value={s.colorManzanos} onChange={v => set('colorManzanos', v)}
            options={COLORES_CHOICES} placeholder="Seleccionar" error={errors.colorManzanos} />
        </Field>
        <Field label="Color Coronas" error={errors.colorCoronas}>
          <Select value={s.colorCoronas} onChange={v => set('colorCoronas', v)}
            options={COLORES_CHOICES} placeholder="Seleccionar" error={errors.colorCoronas} />
        </Field>
      </div>

      <hr className="pf-divider" />

      <div className="pf-grid-2">
        <Field label="Color Cordón" error={errors.colorCordon1}>
          <Select value={s.colorCordon1} onChange={v => set('colorCordon1', v)}
            options={COLORES_CHOICES} placeholder="Cordón principal" error={errors.colorCordon1} />
        </Field>
        <Field label="Color Cordón Combinado" optional>
          <Select value={s.colorCordon2} onChange={v => set('colorCordon2', v)}
            options={COLORES_CHOICES} placeholder="Cordón combinado" />
        </Field>
      </div>
    </div>
  );
};

/* Step 3: Imágenes */
const StepImagenes = ({ imagenes, onAdd, onRemove, onPrincipal, fileRef }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
    <div>
      <p className="pf-section-title">Imágenes del Producto</p>
      <p className="pf-section-sub">
        Sube hasta {LIMITE_IMAGENES} imágenes · {imagenes.length}/{LIMITE_IMAGENES} añadidas
      </p>
    </div>

    {imagenes.length < LIMITE_IMAGENES && (
      <div className="pf-dropzone" onClick={() => fileRef.current.click()}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && fileRef.current.click()}
        aria-label="Agregar imágenes del producto">
        <div className="pf-dropzone-icon">⊕</div>
        <p className="pf-dropzone-text">Haz clic para agregar imágenes</p>
        <p className="pf-dropzone-sub">JPG, PNG, WEBP · Max {LIMITE_IMAGENES - imagenes.length} más</p>
      </div>
    )}

    {imagenes.length > 0 && (
      <div className="pf-image-grid">
        {imagenes.map((img, i) => (
          <div key={i} className={`pf-image-card${img.esPrincipal ? ' principal' : ''}`}>
            {img.esPrincipal && <span className="pf-badge-principal">★ Principal</span>}
            <img src={img.preview} alt={`Imagen ${i + 1}`} />
            <div className="pf-image-overlay">
              {!img.esPrincipal && (
                <button type="button" className="pf-image-action star"
                  onClick={() => onPrincipal(i)} title="Marcar como principal"
                  aria-label="Marcar como imagen principal">★</button>
              )}
              <button type="button" className="pf-image-action del"
                onClick={() => onRemove(i)} title="Eliminar imagen"
                aria-label="Eliminar imagen">✕</button>
            </div>
          </div>
        ))}
      </div>
    )}

    {imagenes.length === 0 && (
      <p style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 4 }}>
        Ninguna imagen seleccionada. La primera imagen marcada será la imagen principal.
      </p>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   MAIN FORM COMPONENT
───────────────────────────────────────────── */
const INITIAL_STATE = {
  tipo: null, modelo: null, precio: '', categoria_id: null,
  colorPrincipal: null, colorTejido: null,
  colorCordon1: null, colorCordon2: null,
  colorSogaRienda: null, colorManzanos: null, colorCoronas: null,
  observaciones: '',
};

const VALIDATORS = {
  1: (s) => {
    const e = {};
    if (!s.categoria_id) e.categoria_id = 'Selecciona una categoría';
    if (!s.tipo)         e.tipo         = 'Selecciona un tipo';
    if (!s.modelo)       e.modelo       = 'Selecciona un modelo';
    if (!s.precio || Number(s.precio) <= 0) e.precio = 'Ingresa un precio válido';
    return e;
  },
  2: (s) => {
    const e = {};
    if (!s.colorPrincipal)  e.colorPrincipal  = 'Selecciona el color principal';
    if (!s.colorTejido)     e.colorTejido     = 'Selecciona el color tejido';
    if (!s.colorCordon1)    e.colorCordon1    = 'Selecciona el color cordón';
    if (!s.colorSogaRienda) e.colorSogaRienda = 'Selecciona el color soga rienda';
    if (!s.colorManzanos)   e.colorManzanos   = 'Selecciona el color manzanos';
    if (!s.colorCoronas)    e.colorCoronas    = 'Selecciona el color coronas';
    return e;
  },
  3: () => ({}),
};

const ProductoForm = ({ mostrarModal, cargarProductos }) => {
  const toast      = useRef(null);
  const fileRef    = useRef(null);
  const panelRef   = useRef(null);

  const [step, setStep]     = useState(1);
  const [state, setState]   = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [imagenes, setImagenes] = useState([]);
  const [categoriaApi, setCategoriaApi] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setState(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => { const n = {...prev}; delete n[key]; return n; });
  };

  /* load categories */
  useEffect(() => {
    CategoriaService.getAllCategorias()
      .then(res => setCategoriaApi(res.map(c => ({ label: c.nombre, value: c.id }))))
      .catch(err => console.error('Error al cargar categorías:', err));
  }, []);

  /* cleanup blob urls */
  useEffect(() => () => imagenes.forEach(i => URL.revokeObjectURL(i.preview)), [imagenes]);

  /* scroll panel to top on step change */
  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [step]);

  /* ── image handlers ── */
  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files);
    const room  = LIMITE_IMAGENES - imagenes.length;
    if (room <= 0) return;
    const valid = files.slice(0, room).filter(f => f.type.startsWith('image/'));
    const newImgs = valid.map((file, i) => ({
      file, preview: URL.createObjectURL(file),
      esPrincipal: imagenes.length === 0 && i === 0,
    }));
    setImagenes(prev => [...prev, ...newImgs]);
    e.target.value = '';
  };

  const handleRemove = (idx) => {
    setImagenes(prev => {
      const rm = prev[idx];
      URL.revokeObjectURL(rm.preview);
      const next = prev.filter((_, i) => i !== idx);
      if (rm.esPrincipal && next.length) next[0] = { ...next[0], esPrincipal: true };
      return next;
    });
  };

  const handlePrincipal = (idx) => {
    setImagenes(prev => prev.map((img, i) => ({ ...img, esPrincipal: i === idx })));
  };

  /* ── navigation ── */
  const goNext = () => {
    const errs = VALIDATORS[step](state);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => Math.min(s + 1, 3));
  };

  const goBack = () => { setErrors({}); setStep(s => Math.max(s - 1, 1)); };

  /* ── submit ── */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const producto = {
        tipo: state.tipo, modelo: state.modelo, precio: Number(state.precio),
        colorPrincipal: state.colorPrincipal, colorTejido: state.colorTejido,
        colorCordon1: state.colorCordon1, colorCordon2: state.colorCordon2 || null,
        colorSogaRienda: state.colorSogaRienda, colorManzanos: state.colorManzanos,
        colorCoronas: state.colorCoronas,
        observaciones: state.observaciones || 'No hay Observaciones',
        categoria_id: state.categoria_id,
      };

      const creado = await ProductoService.crearProducto(producto);

      if (imagenes.length > 0) {
        await Promise.all(
          imagenes.map(img => GrupoImagenesService.subirImagen(creado.id, img.file, img.esPrincipal))
        );
      }

      const todos = await ProductoService.getAllProductos();
      cargarProductos(todos);
      setState(INITIAL_STATE);
      setImagenes([]);
      setStep(1);
      mostrarModal(false);
    } catch (err) {
      console.error(err);
      toast.current.show({ severity:'error', summary:'Error', detail:'Ocurrió un error al guardar el producto.', life:4000 });
    } finally {
      setLoading(false);
    }
  };

  /* ── render ── */
  return (
    <>
      <style>{globalStyles}</style>
      <div className="pf-root">
        <Toast ref={toast} />

        {/* Hidden file input */}
        <input ref={fileRef} type="file" accept="image/*" multiple
          style={{ display:'none' }} onChange={handleAddFiles} />

        {/* Stepper */}
        <nav className="pf-stepper" aria-label="Pasos del formulario">
          {STEPS.map((s) => {
            const cls = s.id === step ? 'active' : s.id < step ? 'done' : '';
            return (
              <div key={s.id} className={`pf-step ${cls}`} aria-current={s.id === step ? 'step' : undefined}>
                <div className="pf-step-dot">
                  {s.id < step ? '✓' : s.icon}
                </div>
                <span className="pf-step-label">{s.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Panel */}
        <div ref={panelRef} style={{ overflowY:'auto', maxHeight:'calc(80vh - 160px)', paddingRight: 4 }}>
          {step === 1 && <StepInfo  state={state} set={set} errors={errors} categoriaApi={categoriaApi} />}
          {step === 2 && <StepColores state={state} set={set} errors={errors} />}
          {step === 3 && (
            <StepImagenes
              imagenes={imagenes} onAdd={handleAddFiles}
              onRemove={handleRemove} onPrincipal={handlePrincipal}
              fileRef={fileRef}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="pf-nav">
          {step > 1
            ? <button type="button" className="pf-btn pf-btn-ghost" onClick={goBack}>← Anterior</button>
            : <div />
          }

          {step < 3
            ? <button type="button" className="pf-btn pf-btn-primary" onClick={goNext}>Continuar →</button>
            : (
              <button type="button" className="pf-btn pf-btn-primary"
                onClick={handleSubmit} disabled={loading}
                aria-busy={loading}>
                {loading ? <><span className="pf-spinner" aria-hidden /> Guardando…</> : '✓ Registrar Producto'}
              </button>
            )
          }
        </div>
      </div>
    </>
  );
};

export default ProductoForm;