import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { PrimeReactProvider } from "primereact/api";
import 'primeicons/primeicons.css';
import Tailwind from 'primereact/passthrough/tailwind';
import './index.css'


createRoot(document.getElementById('root')).render(
  <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
   <StrictMode>
      <App />
    </StrictMode>
  </PrimeReactProvider>,
  )
