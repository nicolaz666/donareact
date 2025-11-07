import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Clientes from "./pages/Clientes"
import Categorias from "./pages/Categorias/Categorias"
import MostrarVentas from "./pages/MostrarVentas"
import Producto from "./pages/Productos/Producto"

function App() {


  return (


      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout/>} >
                <Route index element={<Home/>}></Route>
                <Route path="Clientes" element={<Clientes/>}></Route>
                <Route path="Categorias" element={<Categorias/>}></Route>
                <Route path="MostrarVentas" element={<MostrarVentas/>}></Route>
                <Route path="Producto" element={<Producto/>}></Route>

            </Route>
        </Routes>
      </BrowserRouter>
  )
}

export default App
