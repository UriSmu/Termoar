const services = [
  {
    title: 'Ingeniería y selección',
    description:
      'Relevamiento del punto de medición, compatibilidad de materiales y definición del conjunto sensor + protección + conexión.',
  },
  {
    title: 'Fabricación y ensamble',
    description:
      'Ejecución de armados según planos y criterios de calidad. Identificación unívoca y documentación asociada.',
  },
  {
    title: 'Calibración / verificación',
    description:
      'Soporte para calibraciones y verificaciones según requerimiento de trazabilidad. Entrega de documentación y registros.',
  },
  {
    title: 'Mantenimiento y recambio',
    description:
      'Análisis de falla, recomendaciones de mejora y reemplazos planificados para minimizar paradas y riesgos de proceso.',
  },
  {
    title: 'Puesta en marcha',
    description:
      'Asistencia en la instalación, chequeos de señal y configuración de transmisores para una integración confiable.',
  },
  {
    title: 'Capacitación',
    description:
      'Acompañamiento a mantenimiento y operación: buenas prácticas, criterios de selección y documentación mínima.',
  },
]

function ServiceCard({ title, description }) {
  return (
    <article className="card service-card">
      <div className="media" aria-hidden="true"></div>
      <div className="card-body">
        <h3>{title}</h3>
        <p className="muted">{description}</p>
      </div>
    </article>
  )
}

export default function ServicesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="page-head">
          <h1>Servicios</h1>
          <p className="muted">
            Servicios orientados a asegurar continuidad operativa, calidad metrológica y documentación para auditorías.
          </p>
        </div>

        <div className="cards three">
          {services.map((s) => (
            <ServiceCard key={s.title} title={s.title} description={s.description} />
          ))}
        </div>

        <div className="notice">
          <p className="muted">
            Coordinamos visitas y relevamientos. Escribinos desde la página de Contacto o por WhatsApp.
          </p>
        </div>
      </div>
    </section>
  )
}
