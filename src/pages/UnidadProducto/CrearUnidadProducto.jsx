import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import UnidadProductoService from "../../services/UnidadProductoService";

const CrearUnidadProducto = ({ producto, onSuccess }) => {
  const [cantidad, setCantidad] = useState("");

  const guardar = async () => {
    await UnidadProductoService.crearUnidadProducto({
      
      estado: "disponible",
      producto: producto.id,
    });
    onSuccess();
  };

  return (
    <>
      <p><strong>Producto:</strong> {producto.id}</p>

      <InputText
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        placeholder="Cantidad"
        className="w-full mb-3"
      />

      <Button
        label="Guardar Unidad"
        severity="success"
        onClick={guardar}
      />
    </>
  );
};

export default CrearUnidadProducto;