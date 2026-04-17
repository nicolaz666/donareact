export const formatearFecha = (fechaISO) => {
  if (!fechaISO) return 'N/A';
  try {
    return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(fechaISO));
  } catch {
    return 'Fecha inválida';
  }
};

export const formatearNumero = (num) => {
  if (num === null || num === undefined) return '0.00';
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};

export const formatearPrecio = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
