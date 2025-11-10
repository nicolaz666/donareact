// React import not required with the new JSX transform

function VentasFormSummary({ products, total, abono }) {
  total = products.reduce((sum, product) => sum + product.precio * product.quantity, 0);
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal:</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Abono:</span>
        <span className="text-indigo-600">${abono.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-semibold pt-2 border-t">
        <span>Saldo Total:</span>
        <span>${total-abono}</span>
      </div>
    </div>
  );
}

export default VentasFormSummary