import { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import UnidadProductoService from "../../services/UnidadProductoService";

const CrearUnidadProducto = ({ producto, onSuccess }) => {
  const [cantidad, setCantidad] = useState("");

    useEffect(() => {
    console.log("Componente CrearUnidadProducto renderizado");
    console.log("Producto recibido:", producto.id);
  }, []); 

  const guardar = async () => {
  try {
    const response = await UnidadProductoService.crearUnidadProducto({
      estado: "disponible",
      producto: producto.id,
    });

    console.log("Respuesta backend:", response);
    onSuccess();

  } catch (error) {
    console.error("❌ Error creando unidad:", error.response?.data || error);
  }
};


  return <div>
    <p><strong>Producto:</strong> {producto.id}</p>

      <Button
        label="Guardar Unidad"
        severity="success"
        onClick={guardar}
      />
  </div>
};

export default CrearUnidadProducto;