import { jsPDF } from 'jspdf';
import { StatusBadge } from "../../components/ui/table";
import { formatearFecha, formatearNumero } from "../../utils/formatters";

/* ── helpers ── */
const ini = (str) => (str?.[0] || '?').toUpperCase();

const Chip = ({ children, color = 'gray' }) => {
  const colors = {
    gray:   'bg-gray-100 text-gray-600',
    indigo: 'bg-indigo-100 text-indigo-700',
    green:  'bg-green-100 text-green-700',
    amber:  'bg-amber-100 text-amber-700',
    red:    'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

/* ── PDF generator ── */
const generarPDF = ({ rowData, abonosVenta, detallesVenta, totalAbonado }) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 14;
  const col2 = W / 2;
  let y = 0;

  const font = (size, style = 'normal', color = [30, 30, 30]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
  };
  const line = (x1, y1, x2, y2, color = [220, 220, 220], lw = 0.3) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(lw);
    doc.line(x1, y1, x2, y2);
  };
  const rect = (x, yy, w, h, fill, stroke) => {
    if (fill) doc.setFillColor(...fill);
    if (stroke) doc.setDrawColor(...stroke);
    doc.roundedRect(x, yy, w, h, 2, 2, fill && stroke ? 'FD' : fill ? 'F' : 'S');
  };
  const addPage = () => { doc.addPage(); y = margin; };
  const checkY = (needed = 12) => { if (y + needed > 275) addPage(); };

  /* ── HEADER ── */
  rect(0, 0, W, 38, [79, 70, 229]);
  font(18, 'bold', [255, 255, 255]);
  doc.text('DONACIANO', margin, 14);
  font(8, 'normal', [199, 210, 254]);
  doc.text('Aperos & Talabartería', margin, 20);

  font(20, 'bold', [255, 255, 255]);
  doc.text('ORDEN DE VENTA', W - margin, 12, { align: 'right' });
  font(10, 'normal', [199, 210, 254]);
  doc.text(`#${rowData.id}`, W - margin, 19, { align: 'right' });

  const estadoLabel = rowData.estado === 'entregado' ? 'ENTREGADO' : rowData.estado === 'pendiente' ? 'PENDIENTE' : (rowData.estado || '').toUpperCase();
  const estadoColor = rowData.estado === 'entregado' ? [134, 239, 172] : [253, 224, 132];
  rect(W - margin - 30, 24, 30, 9, estadoColor);
  doc.setTextColor(30, 30, 30);
  font(7, 'bold', [30, 30, 30]);
  doc.text(estadoLabel, W - margin - 15, 30, { align: 'center' });

  y = 46;

  /* ── INFO ROW ── */
  font(7, 'normal', [100, 116, 139]);
  doc.text('FECHA DE VENTA', margin, y);
  doc.text('FECHA DE ENTREGA', col2, y);
  font(9, 'bold', [30, 30, 30]);
  doc.text(formatearFecha(rowData.fecha_venta) || '—', margin, y + 5);
  doc.text(formatearFecha(rowData.fecha_entrega_estimada) || '—', col2, y + 5);
  y += 14;
  line(margin, y, W - margin, y);
  y += 6;

  /* ── CLIENTE ── */
  font(7, 'normal', [100, 116, 139]);
  doc.text('CLIENTE', margin, y);
  y += 5;
  font(11, 'bold', [30, 30, 30]);
  doc.text(`${rowData.cliente?.nombre || ''} ${rowData.cliente?.apellido || ''}`.trim() || 'N/A', margin, y);
  font(8, 'normal', [100, 116, 139]);
  doc.text(`Identificación: ${rowData.cliente?.identificacion || 'N/A'}`, margin, y + 5);
  y += 13;
  line(margin, y, W - margin, y);
  y += 7;

  /* ── PRODUCTOS TABLE ── */
  font(7, 'bold', [100, 116, 139]);
  doc.text('PRODUCTOS', margin, y);
  y += 5;

  // Column right-edges (right-aligned anchors)
  const cDesc = margin + 2;   // description left edge
  const cCant = margin + 108; // quantity right edge  (~7mm col)
  const cUnit = margin + 148; // unit price right edge (~40mm col)
  const cSub  = W - margin;   // subtotal right edge  (~38mm col)

  // Table header
  rect(margin, y, W - margin * 2, 7, [241, 245, 249]);
  font(7, 'bold', [71, 85, 105]);
  doc.text('DESCRIPCIÓN', cDesc, y + 4.8);
  doc.text('CANT.', cCant, y + 4.8, { align: 'right' });
  doc.text('P. UNIT.', cUnit, y + 4.8, { align: 'right' });
  doc.text('SUBTOTAL', cSub, y + 4.8, { align: 'right' });
  y += 9;

  detallesVenta.forEach((det, i) => {
    const rowH = 14;
    checkY(rowH);
    if (i % 2 === 0) rect(margin, y - 1, W - margin * 2, rowH, [249, 250, 251]);
    const p = det.producto;
    const nombre = p ? `${p.tipo} — ${p.modelo}` : `Producto #${det.producto_id}`;
    const subInfo = [p?.categoria?.nombre, p?.colorPrincipal, p?.colorTejido ? `Tejido: ${p.colorTejido}` : '']
      .filter(Boolean).join(' · ');
    const precio = Number(p?.precio || 0);
    const subtotal = precio * (det.cantidad || 0);

    font(8, 'bold', [30, 30, 30]);
    doc.text(doc.splitTextToSize(nombre, 90)[0], cDesc, y + 5);
    if (subInfo) {
      font(7, 'normal', [120, 130, 150]);
      doc.text(doc.splitTextToSize(subInfo, 90)[0], cDesc, y + 10);
    }
    font(8, 'normal', [71, 85, 105]);
    doc.text(String(det.cantidad || 0), cCant, y + 5, { align: 'right' });
    doc.text(`$${formatearNumero(precio)}`, cUnit, y + 5, { align: 'right' });
    font(8, 'bold', [79, 70, 229]);
    doc.text(`$${formatearNumero(subtotal)}`, cSub, y + 5, { align: 'right' });
    y += rowH;
  });

  checkY(10);
  line(margin, y, W - margin, y, [200, 200, 220], 0.5);
  y += 4;
  font(8, 'bold', [30, 30, 30]);
  const totalUnidades = detallesVenta.reduce((s, d) => s + (d.cantidad || 0), 0);
  doc.text('Total unidades:', cUnit, y + 4, { align: 'right' });
  doc.text(String(totalUnidades), cSub, y + 4, { align: 'right' });
  y += 12;

  /* ── ABONOS ── */
  if (abonosVenta.length > 0) {
    checkY(20);
    line(margin, y, W - margin, y);
    y += 7;
    font(7, 'bold', [100, 116, 139]);
    doc.text('HISTORIAL DE PAGOS', margin, y);
    y += 6;

    // header — MONTO tiene 42mm (cSub=196, desde x=154)
    const pFecha  = margin + 2;
    const pMetodo = margin + 50;
    const pComent = margin + 105;
    const pMonto  = W - margin; // right-aligned

    rect(margin, y, W - margin * 2, 7, [241, 245, 249]);
    font(7, 'bold', [71, 85, 105]);
    doc.text('FECHA', pFecha, y + 4.8);
    doc.text('MÉTODO', pMetodo, y + 4.8);
    doc.text('COMENTARIO', pComent, y + 4.8);
    doc.text('MONTO', pMonto, y + 4.8, { align: 'right' });
    y += 9;

    abonosVenta.forEach((ab, i) => {
      checkY(10);
      if (i % 2 === 0) rect(margin, y - 1, W - margin * 2, 9, [249, 250, 251]);
      font(8, 'normal', [30, 30, 30]);
      doc.text(formatearFecha(ab.fecha_abono) || '—', pFecha, y + 4);
      doc.text((ab.metodo_pago || 'N/A').substring(0, 18), pMetodo, y + 4);
      font(7, 'normal', [100, 116, 139]);
      // comentario limitado para no solaparse con MONTO (~42mm desde x=154)
      doc.text((ab.comentario || '—').substring(0, 22), pComent, y + 4);
      font(8, 'bold', [22, 163, 74]);
      doc.text(`$${formatearNumero(ab.monto_abonado)}`, pMonto, y + 4, { align: 'right' });
      y += 9;
    });
    y += 2;
  }

  /* ── RESUMEN FINANCIERO ── */
  checkY(40);
  line(margin, y, W - margin, y);
  y += 7;

  const total = Number(rowData.total || 0);
  const saldo = Number(rowData.debe || 0);
  const pagado = totalAbonado;
  const pct = total > 0 ? Math.min(100, (pagado / total) * 100) : 0;

  rect(margin, y, W - margin * 2, 36, [248, 250, 252], [220, 220, 240]);
  font(7, 'bold', [100, 116, 139]);
  doc.text('RESUMEN FINANCIERO', margin + 4, y + 6);

  const col = W - margin * 2;
  const rx = margin + 4;
  font(8, 'normal', [71, 85, 105]);
  doc.text('Total de la venta:', rx, y + 13);
  font(9, 'bold', [79, 70, 229]);
  doc.text(`$${formatearNumero(total)}`, margin + col - 4, y + 13, { align: 'right' });

  font(8, 'normal', [71, 85, 105]);
  doc.text('Total abonado:', rx, y + 20);
  font(9, 'bold', [22, 163, 74]);
  doc.text(`$${formatearNumero(pagado)}`, margin + col - 4, y + 20, { align: 'right' });

  // progress bar
  rect(rx, y + 23, col - 8, 2.5, [220, 220, 235]);
  if (pct > 0) rect(rx, y + 23, (col - 8) * pct / 100, 2.5, pct >= 100 ? [22, 163, 74] : [79, 70, 229]);

  line(rx, y + 28, margin + col - 4, y + 28, [200, 200, 220], 0.5);
  font(9, 'bold', [30, 30, 30]);
  doc.text('SALDO PENDIENTE:', rx, y + 34);
  font(12, 'bold', saldo > 0 ? [220, 38, 38] : [22, 163, 74]);
  doc.text(`$${formatearNumero(saldo)}`, margin + col - 4, y + 34, { align: 'right' });
  y += 43;

  /* ── COMENTARIOS ── */
  if (rowData.comentarios?.trim()) {
    checkY(20);
    line(margin, y, W - margin, y);
    y += 7;
    font(7, 'bold', [100, 116, 139]);
    doc.text('NOTAS', margin, y);
    y += 5;
    font(8, 'normal', [71, 85, 105]);
    const lines = doc.splitTextToSize(rowData.comentarios.trim(), W - margin * 2);
    lines.forEach(l => { checkY(5); doc.text(l, margin, y); y += 5; });
    y += 3;
  }

  /* ── FOOTER ── */
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    line(margin, 285, W - margin, 285, [200, 200, 220]);
    font(7, 'normal', [150, 150, 150]);
    doc.text('Donaciano — Aperos & Talabartería', margin, 290);
    doc.text(`Pág. ${p} / ${pageCount}`, W - margin, 290, { align: 'right' });
  }

  doc.save(`orden-venta-${rowData.id}.pdf`);
};

/* ── Main component ── */
const VentasDescripcionModal = ({ rowData, abonosVenta, detallesVenta, loading, onVerUnidades }) => {
  if (!rowData) return <p className="p-6 text-gray-400 text-center text-sm">Sin datos</p>;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-[3px] border-indigo-600" />
        <p className="text-gray-400 text-sm">Cargando información…</p>
      </div>
    );
  }

  const totalAbonado = abonosVenta.reduce((s, a) => s + parseFloat(a.monto_abonado || 0), 0);
  const saldo = Number(rowData.debe || 0);
  const total = Number(rowData.total || 0);
  const pct = total > 0 ? Math.min(100, (totalAbonado / total) * 100) : 0;
  const pagado = saldo <= 0 && totalAbonado > 0;

  return (
    <div className="flex flex-col h-full">

      {/* ── TOP HERO ── */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-5 pt-5 pb-6 flex-shrink-0">
        {/* ID + estado + PDF */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-indigo-300 text-xs font-medium uppercase tracking-widest mb-0.5">Orden de venta</p>
            <p className="text-white text-2xl font-extrabold leading-none">#{rowData.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge value={rowData.estado} dot />
            <button
              onClick={() => generarPDF({ rowData, abonosVenta, detallesVenta, totalAbonado })}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors border border-white/20"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              PDF
            </button>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-indigo-300 text-xs mb-0.5">Fecha venta</p>
            <p className="text-white text-sm font-semibold">{formatearFecha(rowData.fecha_venta) || '—'}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-indigo-300 text-xs mb-0.5">Entrega estimada</p>
            <p className="text-white text-sm font-semibold">{formatearFecha(rowData.fecha_entrega_estimada) || '—'}</p>
          </div>
        </div>

        {/* Resumen financiero en el hero */}
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">Total</p>
              <p className="text-sm font-extrabold text-indigo-700">${formatearNumero(total)}</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">Pagado</p>
              <p className="text-sm font-extrabold text-green-600">${formatearNumero(totalAbonado)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">Saldo</p>
              <p className={`text-sm font-extrabold ${saldo > 0 ? 'text-red-500' : 'text-green-600'}`}>
                ${formatearNumero(saldo)}
              </p>
            </div>
          </div>
          {/* Barra progreso */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: pct >= 100 ? '#16a34a' : '#6366f1' }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-gray-400">{pct.toFixed(0)}% pagado</span>
            {pagado
              ? <span className="text-xs font-bold text-green-600 flex items-center gap-1">✓ Pago completo</span>
              : <span className="text-xs text-red-400 font-medium">Pendiente</span>
            }
          </div>
        </div>
      </div>

      {/* ── BODY SCROLLABLE ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 space-y-4">

          {/* ── Cliente ── */}
          <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</h3>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700 font-extrabold text-lg">
                {ini(rowData.cliente?.nombre)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 text-sm leading-snug">
                  {rowData.cliente?.nombre || ''} {rowData.cliente?.apellido || ''}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {rowData.cliente?.identificacion ? `CC: ${rowData.cliente.identificacion}` : 'Sin identificación'}
                </p>
              </div>
              {rowData.cliente?.total_ventas > 0 && (
                <Chip color="indigo">{rowData.cliente.total_ventas} ventas</Chip>
              )}
            </div>
          </section>

          {/* ── Productos ── */}
          <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Productos</h3>
              </div>
              <Chip color="indigo">{detallesVenta.length} {detallesVenta.length === 1 ? 'ítem' : 'ítems'}</Chip>
            </div>

            {detallesVenta.length > 0 ? (
              <div>
                {detallesVenta.map((det, i) => (
                  <div key={det.id ?? i} className={`px-4 py-3 ${i < detallesVenta.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    {det.producto ? (
                      <div className="space-y-2">
                        {/* Fila principal */}
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm leading-snug">
                              {det.producto.tipo} — {det.producto.modelo}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{det.producto.categoria?.nombre || 'Sin categoría'}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-gray-400">
                              {det.cantidad} × ${formatearNumero(det.producto.precio || 0)}
                            </p>
                            <p className="text-sm font-extrabold text-indigo-700">
                              ${formatearNumero((det.producto.precio || 0) * (det.cantidad || 0))}
                            </p>
                          </div>
                        </div>

                        {/* Colores */}
                        {(det.producto.colorPrincipal || det.producto.colorTejido) && (
                          <div className="flex flex-wrap gap-1.5">
                            {det.producto.colorPrincipal && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {det.producto.colorPrincipal}
                              </span>
                            )}
                            {det.producto.colorTejido && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                Tejido: {det.producto.colorTejido}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Observaciones */}
                        {det.producto.observaciones && det.producto.observaciones !== 'No hay Observaciones' && (
                          <p className="text-xs text-gray-400 italic">{det.producto.observaciones}</p>
                        )}

                        {/* Ver unidades */}
                        <button
                          onClick={() => onVerUnidades(det.producto.id, det.producto, det.id, det.venta)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          Ver unidades vendidas
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-1">Producto no disponible</p>
                    )}
                  </div>
                ))}

                {/* Footer totales */}
                <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50">
                  <span className="text-xs text-gray-500 font-medium">
                    {detallesVenta.reduce((s, d) => s + (d.cantidad || 0), 0)} unidades en total
                  </span>
                  <span className="text-sm font-extrabold text-indigo-700">
                    ${formatearNumero(total)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic text-center py-8">Sin productos registrados</p>
            )}
          </section>

          {/* ── Historial de pagos ── */}
          <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pagos</h3>
              </div>
              <Chip color={abonosVenta.length > 0 ? 'green' : 'gray'}>{abonosVenta.length} registros</Chip>
            </div>

            {abonosVenta.length > 0 ? (
              <div>
                {abonosVenta.map((ab, i) => (
                  <div key={i} className={`px-4 py-3 flex items-center gap-3 ${i < abonosVenta.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    {/* Icono */}
                    <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-green-700">${formatearNumero(ab.monto_abonado)}</span>
                        {ab.metodo_pago && <Chip color="gray">{ab.metodo_pago}</Chip>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{formatearFecha(ab.fecha_abono)}</span>
                        {ab.comentario && (
                          <span className="text-xs text-gray-400 truncate">· {ab.comentario}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-300 flex-shrink-0">#{ab.id}</span>
                  </div>
                ))}

                <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-green-50">
                  <span className="text-xs text-gray-500 font-medium">Total pagado</span>
                  <span className="text-sm font-extrabold text-green-700">${formatearNumero(totalAbonado)}</span>
                </div>
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">Sin pagos registrados</p>
              </div>
            )}
          </section>

          {/* ── Notas ── */}
          {rowData.comentarios?.trim() && (
            <section className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">Notas</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{rowData.comentarios}</p>
            </section>
          )}

          {/* Espacio al final para que el scroll no corte */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default VentasDescripcionModal;
