import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Clientes from "./pages/Clientes"
import Categorias from "./pages/Categorias/Categorias"
import MostrarVentas from "./pages/MostrarVentas"
import Producto from "./pages/Productos/Producto"
import AuthService from './services/AuthService';
import Login from './pages/Auth/Login';

function ProtectedRoute() {
  return AuthService.isAuthenticated()
    ? <Outlet />
    : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      <Routes>

        {/* ✅ Ruta pública (FUERA del layout) */}
        <Route path="/login" element={<Login />} />

        {/* ✅ Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>

            <Route index element={<Home />} />
            <Route path="Clientes" element={<Clientes />} />
            <Route path="Categorias" element={<Categorias />} />
            <Route path="MostrarVentas" element={<MostrarVentas />} />
            <Route path="Producto" element={<Producto />} />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App
