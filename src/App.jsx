import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from './components/SiteLayout/SiteLayout.jsx'
import HomePage from './pages/HomePage/HomePage.jsx'
import ProductsPage from './pages/ProductsPage/ProductsPage.jsx'
import ServicesPage from './pages/ServicesPage/ServicesPage.jsx'
import AboutPage from './pages/AboutPage/AboutPage.jsx'
import ContactPage from './pages/ContactPage/ContactPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/nosotros" element={<AboutPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
