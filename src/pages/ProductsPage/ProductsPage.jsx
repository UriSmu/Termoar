const products = [
  {
    title: 'Sensores RTD / PT100',
    description:
      'Configuraciones para uso industrial con distintas longitudes, elementos y conexiones. Opciones para alta estabilidad y repetibilidad.',
  },
  {
    title: 'Termopares (Tipo K, J, T, etc.)',
    description:
      'Soluciones para altas temperaturas y ambientes exigentes. Armados especiales según proceso y normativa aplicable.',
  },
  {
    title: 'Vainas termométricas',
    description:
      'Protección mecánica y química del elemento sensor. Materiales y conexiones según presión, vibración y corrosión.',
  },
  {
    title: 'Transmisores y cabezales',
    description:
      'Integración con sistemas de control (4–20 mA, HART u otras opciones según necesidad). Montaje en cabezal o riel.',
  },
  {
    title: 'Cables y accesorios',
    description:
      'Extensiones, conectores, prensaestopas, pasamuros y componentes para instalaciones seguras y trazables.',
  },
  {
    title: 'Conjuntos especiales',
    description:
      'Diseños a medida para plantas, laboratorios y OEM. Identificación y documentación para mantenimiento y auditoría.',
  },
]

function ProductCard({ title, description }) {
  return (
    <article className="card product-card">
      <div className="media" aria-hidden="true"></div>
      <div className="card-body">
        <h3>{title}</h3>
        <p className="muted">{description}</p>
      </div>
    </article>
  )
}

export default function ProductsPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="page-head">
          <h1>Productos</h1>
          <p className="muted">
            Portfolio orientado a procesos industriales. Las configuraciones finales dependen del punto de medición y
            requerimientos de instalación.
          </p>
        </div>

        <div className="cards three">
          {products.map((p) => (
            <ProductCard key={p.title} title={p.title} description={p.description} />
          ))}
        </div>

        <div className="notice">
          <p className="muted">
            ¿Necesitás una especificación? Enviá rango de temperatura, tipo de proceso, presión, conexión y longitud
            requerida.
          </p>
        </div>
      </div>
    </section>
  )
}
