import { NavLink } from 'react-router-dom'

export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">TERMOMETRÍA • INDUSTRIA • CALIDAD</p>
            <h1>Termometría Argentina</h1>
            <p className="lead">
              Desarrollo y provisión de soluciones de medición de temperatura para procesos críticos,
              con foco en trazabilidad, confiabilidad y cumplimiento normativo.
            </p>
            <div className="cta-row">
              <NavLink className="btn primary" to="/productos">
                Ver productos
              </NavLink>
              <NavLink className="btn" to="/servicios">
                Ver servicios
              </NavLink>
            </div>
          </div>

          <div className="hero-card" aria-label="Resumen">
            <div className="stats">
              <div className="stat">
                <p className="stat-kpi">Calidad</p>
                <p className="muted">Enfoque en documentación y control.</p>
              </div>
              <div className="stat">
                <p className="stat-kpi">Trazabilidad</p>
                <p className="muted">Registros claros para auditorías.</p>
              </div>
              <div className="stat">
                <p className="stat-kpi">Soporte</p>
                <p className="muted">Acompañamiento técnico post-venta.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Qué hacemos</h2>
          <p className="muted">
            Diseñamos, fabricamos y proveemos sensores, instrumentos y accesorios para termometría.
            Integramos soluciones para planta, mantenimiento y laboratorios, priorizando seguridad,
            repetibilidad y robustez en campo.
          </p>

          <div className="cards three">
            <article className="card">
              <h3>Instrumentación</h3>
              <p className="muted">
                Termopares, RTD/PT100, transmisores, vainas termométricas y accesorios.
              </p>
            </article>
            <article className="card">
              <h3>Aplicaciones</h3>
              <p className="muted">
                Soluciones para industrias alimenticia, química, energía, oil & gas, farmacéutica y más.
              </p>
            </article>
            <article className="card">
              <h3>Gestión</h3>
              <p className="muted">
                Acompañamos desde la ingeniería hasta la puesta en marcha y el mantenimiento.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>Onboarding rápido</h2>
          <div className="steps">
            <div className="step">
              <p className="step-n">1</p>
              <p className="step-t">Definimos el punto de medición</p>
              <p className="muted">Rango, fluido, presión, ambiente, normativa y conexión.</p>
            </div>
            <div className="step">
              <p className="step-n">2</p>
              <p className="step-t">Seleccionamos el conjunto</p>
              <p className="muted">Sensor + vaina + cabezal/transmisor + cableado.</p>
            </div>
            <div className="step">
              <p className="step-n">3</p>
              <p className="step-t">Documentación y entrega</p>
              <p className="muted">Identificación, planos, certificados y soporte.</p>
            </div>
          </div>

          <div className="cta-row">
            <NavLink className="btn primary" to="/contacto">
              Solicitar cotización
            </NavLink>
            <a className="btn" href="https://wa.me/5491144063448" target="_blank" rel="noreferrer">
              <img className="wa-inline-icon" src="/WhatsApp.png" alt="" />
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
