import { NavLink, Outlet } from 'react-router-dom'

const logoHeader = '/Logo-recortado-hd.png'
const logoFooter = '/Logo-letras-hd.png'
const whatsappIcon = '/WhatsApp.png'

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/productos', label: 'Productos' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        <NavLink to="/" className="brand" aria-label="Ir a inicio">
          <img src={logoHeader} alt="Termometría Argentina" className="brand-logo" />
        </NavLink>

        <nav className="site-nav" aria-label="Navegación principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link${isActive ? ' is-active' : ''}`
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <a
          className="wa-link"
          href="https://wa.me/5491144063448"
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          title="WhatsApp"
        >
          <span className="wa-icon" aria-hidden="true">
            <img className="wa-icon-img" src={whatsappIcon} alt="" />
          </span>
          <span className="wa-text">WhatsApp</span>
        </a>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src={logoFooter} alt="Termometría Argentina" className="footer-logo" />
          <p className="muted">
            Instrumentación y soluciones de termometría para procesos industriales.
          </p>
        </div>

        <div className="footer-col">
          <h3>Contacto</h3>
          <ul className="footer-list">
            <li>
              <a href="mailto:ventas@termoar.com.ar">ventas@termoar.com.ar</a>
            </li>
            <li>
              <a href="https://wa.me/5491144063448" target="_blank" rel="noreferrer">
                WhatsApp: +54 9 11 4406-3448
              </a>
            </li>
            <li className="muted">Argentina</li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Páginas</h3>
          <ul className="footer-list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/'}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="muted">
            © {new Date().getFullYear()} Termometría Argentina. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function SiteLayout() {
  return (
    <div className="site-shell">
      <Header />
      <main className="site-main" role="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
