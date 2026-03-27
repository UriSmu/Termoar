export default function AboutPage() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="page-head">
            <h1>Nosotros</h1>
            <p className="muted">
              Somos una empresa argentina especializada en termometría industrial. Nuestro compromiso es entregar
              soluciones confiables, con documentación clara y orientación a estándares exigidos por la industria.
            </p>
          </div>

          <div className="two-col">
            <div className="card">
              <h3>Historia y propósito</h3>
              <p className="muted">
                Nacimos con el objetivo de acompañar a plantas y laboratorios en la medición de temperatura, un punto
                crítico en seguridad, calidad y eficiencia energética. Con el tiempo ampliamos capacidades de ingeniería,
                fabricación y soporte técnico, manteniendo una cultura de mejora continua.
              </p>
            </div>
            <div className="card">
              <h3>Reconocimiento</h3>
              <p className="muted">
                Trabajamos con organizaciones que requieren consistencia en materiales, trazabilidad de componentes y
                control documental. Buscamos relaciones de largo plazo basadas en respuesta técnica y cumplimiento.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>Certificaciones y cumplimiento</h2>
          <p className="muted">
            Adecuamos documentación, registros y criterios de fabricación a requerimientos del cliente y estándares
            aplicables. A continuación se listan referencias típicas (según alcance de cada proyecto):
          </p>

          <div className="cards three">
            <div className="card">
              <h3>Gestión de calidad</h3>
              <p className="muted">
                Buenas prácticas de control, identificación, trazabilidad y registros para auditorías internas/externas.
              </p>
            </div>
            <div className="card">
              <h3>Trazabilidad metrológica</h3>
              <p className="muted">
                Soporte para calibraciones/verificaciones y conservación de evidencia documental cuando aplica.
              </p>
            </div>
            <div className="card">
              <h3>Seguridad de proceso</h3>
              <p className="muted">
                Selección de materiales, conexiones y protecciones acordes a condiciones de operación.
              </p>
            </div>
          </div>

          <div className="notice">
            <p className="muted">
              Si querés que incluyamos certificaciones específicas y alcance real (p. ej. ISO 9001, calibración acreditada,
              etc.), decime cuáles poseen hoy y las incorporo con precisión.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
