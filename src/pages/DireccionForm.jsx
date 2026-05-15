import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { User, Phone, Globe, Map, MapPin, Home } from 'lucide-react';
import DireccionService from '../services/DireccionService';

const REQUIRED = ['destinatario', 'pais', 'departamento', 'ciudad', 'nomenclatura'];

const INITIAL = {
  destinatario: '', celular: '', pais: '',
  departamento: '', ciudad: '', nomenclatura: '',
};

const Field = ({ label, icon: Icon, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
      {Icon && <Icon size={14} className="text-slate-400" />}
      {label}
    </label>
    {children}
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

const DireccionForm = ({ clienteId, mostrarModal, cargarClientes }) => {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    REQUIRED.forEach(f => { if (!form[f].trim()) errs[f] = 'Campo requerido'; });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await DireccionService.agregarDireccion(clienteId, form);
      await cargarClientes();
      mostrarModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cls = (field) => `w-full${errors[field] ? ' p-invalid' : ''}`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">

      <Field label="Destinatario" icon={User} error={errors.destinatario}>
        <InputText
          placeholder="Nombre de quien recibe"
          value={form.destinatario}
          onChange={set('destinatario')}
          className={cls('destinatario')}
        />
      </Field>

      <Field label="Celular" icon={Phone} error={errors.celular}>
        <InputText
          placeholder="Número de contacto"
          value={form.celular}
          onChange={set('celular')}
          className={cls('celular')}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="País" icon={Globe} error={errors.pais}>
          <InputText
            placeholder="País"
            value={form.pais}
            onChange={set('pais')}
            className={cls('pais')}
          />
        </Field>

        <Field label="Departamento" icon={Map} error={errors.departamento}>
          <InputText
            placeholder="Departamento"
            value={form.departamento}
            onChange={set('departamento')}
            className={cls('departamento')}
          />
        </Field>
      </div>

      <Field label="Ciudad" icon={MapPin} error={errors.ciudad}>
        <InputText
          placeholder="Ciudad"
          value={form.ciudad}
          onChange={set('ciudad')}
          className={cls('ciudad')}
        />
      </Field>

      <Field label="Nomenclatura / Dirección" icon={Home} error={errors.nomenclatura}>
        <InputText
          placeholder="Ej: Cra 5 # 10-23, Barrio El Centro"
          value={form.nomenclatura}
          onChange={set('nomenclatura')}
          className={cls('nomenclatura')}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          outlined
          onClick={() => mostrarModal(false)}
          disabled={loading}
        />
        <Button
          type="submit"
          label="Registrar dirección"
          icon="pi pi-check"
          loading={loading}
        />
      </div>

    </form>
  );
};

export default DireccionForm;
