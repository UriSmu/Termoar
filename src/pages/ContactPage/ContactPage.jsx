import { useEffect, useId, useMemo, useState } from 'react'
import { getRecaptchaToken } from '../../lib/recaptchaV3.js'

const initial = {
  nombre: '',
  apellido: '',
  empresa: '',
  telefono: '',
  email: '',
  email2: '',
  asunto: '',
  mensaje: '',
}

function validate(values) {
  const errors = {}

  if (!values.nombre.trim()) errors.nombre = 'Campo obligatorio.'
  if (!values.apellido.trim()) errors.apellido = 'Campo obligatorio.'

  if (!values.email.trim()) errors.email = 'Campo obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'Email inválido.'

  if (!values.email2.trim()) errors.email2 = 'Campo obligatorio.'
  else if (values.email2.trim() !== values.email.trim())
    errors.email2 = 'Los emails no coinciden.'

  if (!values.mensaje.trim()) errors.mensaje = 'Campo obligatorio.'

  return errors
}

export default function ContactPage() {
  const formId = useId()
  const [values, setValues] = useState(initial)
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [waMessage, setWaMessage] = useState('')
  const [waOpen, setWaOpen] = useState(false)
  const [waPinned, setWaPinned] = useState(false)

  const errors = useMemo(() => validate(values), [values])
  const hasErrors = Object.keys(errors).length > 0

  useEffect(() => {
    let cancelled = false

    // Precargar reCAPTCHA para que el script se inyecte antes del submit
    ;(async () => {
      try {
        await getRecaptchaToken('contact')
      } catch {
        // ignoramos: el submit mostrará el error detallado
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      // cleanup any pending timers
      if (window.__waWidgetTimer) {
        clearTimeout(window.__waWidgetTimer)
        window.__waWidgetTimer = null
      }
    }
  }, [])

  function onChange(e) {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  function onBlur(e) {
    const { name } = e.target
    setTouched((t) => ({ ...t, [name]: true }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setTouched({
      nombre: true,
      apellido: true,
      email: true,
      email2: true,
      mensaje: true,
    })

    const currentErrors = validate(values)
    if (Object.keys(currentErrors).length > 0) {
      setStatus({ type: 'error', message: 'Revisá los campos obligatorios.' })
      return
    }

    setStatus({ type: 'loading', message: 'Enviando…' })

    try {
      let recaptchaToken = null
      let recaptchaError = null
      try {
        recaptchaToken = await getRecaptchaToken('contact')
      } catch (err) {
        recaptchaError = err
        recaptchaToken = null
      }

      if (!recaptchaToken) {
        setStatus({
          type: 'error',
          message:
            `No se pudo validar reCAPTCHA. ${
              recaptchaError?.message ? `Detalle: ${recaptchaError.message}. ` : ''
            }Revisá que VITE_RECAPTCHA_SITE_KEY esté configurada, reiniciá \"npm run dev\" y recargá la página. También puede bloquearlo un AdBlock.`,
        })
        return
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          source: 'web',
          recaptchaToken,
        }),
      })

      if (!res.ok) {
        let details = ''
        try {
          const data = await res.json()
          details = data?.details ? ` Detalle: ${JSON.stringify(data.details)}` : ''
        } catch {
          details = ''
        }
        throw new Error(`No se pudo enviar el mensaje.${details}`)
      }

      setValues(initial)
      setTouched({})
      setStatus({ type: 'success', message: 'Mensaje enviado. Nos contactaremos a la brevedad.' })
    } catch (err) {
      setStatus({
        type: 'error',
        message:
          `No pudimos enviar el mensaje desde la web. ${err?.message ? `(${err.message}) ` : ''}Podés escribirnos a ventas@termoar.com.ar o por WhatsApp.`,
      })
    }
  }

  function onWhatsAppSend(e) {
    e.preventDefault()
    const phone = '5491144063448'
    const text = waMessage.trim()
    const url = text
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/${phone}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function waCancelTimer() {
    if (window.__waWidgetTimer) {
      clearTimeout(window.__waWidgetTimer)
      window.__waWidgetTimer = null
    }
  }

  function waScheduleClose(ms = 1600) {
    waCancelTimer()
    window.__waWidgetTimer = setTimeout(() => {
      if (!waPinned) setWaOpen(false)
    }, ms)
  }

  function onWaMouseEnter() {
    setWaOpen(true)
    waCancelTimer()
  }

  function onWaMouseLeave() {
    if (waPinned) return
    waScheduleClose(1600)
  }

  function onWaInteract() {
    setWaOpen(true)
    setWaPinned(true)
    waCancelTimer()
  }

  function onWaClose() {
    setWaPinned(false)
    setWaOpen(false)
    waCancelTimer()
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-head">
          <h1>Contacto</h1>
          <p className="muted">
            Para cotizaciones y consultas técnicas, completá el formulario o escribinos a{' '}
            <a href="mailto:ventas@termoar.com.ar">ventas@termoar.com.ar</a>.
          </p>
        </div>

        <div className="two-col">
          <div className="card">
            <h3>Datos de contacto</h3>
            <ul className="plain-list">
              <li>
                <span className="muted">Email</span>
                <div>
                  <a href="mailto:ventas@termoar.com.ar">ventas@termoar.com.ar</a>
                </div>
              </li>
              <li>
                <span className="muted">WhatsApp</span>
                <div>
                  <a href="https://wa.me/5491144063448" target="_blank" rel="noreferrer">
                    <img className="wa-inline-icon" src="/WhatsApp.png" alt="" />
                    +54 9 11 4406-3448
                  </a>
                </div>
              </li>
            </ul>

            
          </div>

          <form className="card form" onSubmit={onSubmit} noValidate aria-describedby={`${formId}-status`}>
            <h3>Formulario</h3>

            <div
              className={`wa-widget${waOpen ? ' is-open' : ''}${waPinned ? ' is-pinned' : ''}`}
              aria-label="WhatsApp rápido"
              onMouseEnter={onWaMouseEnter}
              onMouseLeave={onWaMouseLeave}
            >
              <div className="wa-widget-badge" aria-hidden="true">
                <img className="wa-widget-icon" src="/WhatsApp.png" alt="" />
              </div>

              <div className="wa-widget-popover">
                {waPinned ? (
                  <button className="wa-widget-close" type="button" onClick={onWaClose} aria-label="Cerrar">
                    ×
                  </button>
                ) : null}
                <p className="wa-widget-title">¿Preferís WhatsApp?</p>
                <div className="wa-widget-form" onFocus={onWaInteract}>
                  <input
                    className="wa-widget-input"
                    value={waMessage}
                    onChange={(e) => {
                      onWaInteract()
                      setWaMessage(e.target.value)
                    }}
                    onClick={onWaInteract}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onWhatsAppSend(e)
                      }
                    }}
                    placeholder="Escribí tu mensaje…"
                    aria-label="Mensaje para WhatsApp"
                  />
                  <button className="wa-widget-send" type="button" onClick={(e) => {
                    onWaInteract()
                    onWhatsAppSend(e)
                  }}>
                    Enviar
                  </button>
                </div>
                <p className="muted small">Se abre una nueva pestaña.</p>
              </div>
            </div>


            <div className="grid two">
              <div className="field">
                <label htmlFor={`${formId}-nombre`}>Nombre *</label>
                <input
                  id={`${formId}-nombre`}
                  name="nombre"
                  value={values.nombre}
                  onChange={onChange}
                  onBlur={onBlur}
                  autoComplete="given-name"
                  required
                />
                {touched.nombre && errors.nombre ? <p className="error">{errors.nombre}</p> : null}
              </div>

              <div className="field">
                <label htmlFor={`${formId}-apellido`}>Apellido *</label>
                <input
                  id={`${formId}-apellido`}
                  name="apellido"
                  value={values.apellido}
                  onChange={onChange}
                  onBlur={onBlur}
                  autoComplete="family-name"
                  required
                />
                {touched.apellido && errors.apellido ? <p className="error">{errors.apellido}</p> : null}
              </div>
            </div>

            <div className="grid two">
              <div className="field">
                <label htmlFor={`${formId}-empresa`}>Empresa</label>
                <input
                  id={`${formId}-empresa`}
                  name="empresa"
                  value={values.empresa}
                  onChange={onChange}
                  onBlur={onBlur}
                  autoComplete="organization"
                />
              </div>

              <div className="field">
                <label htmlFor={`${formId}-telefono`}>Teléfono</label>
                <input
                  id={`${formId}-telefono`}
                  name="telefono"
                  value={values.telefono}
                  onChange={onChange}
                  onBlur={onBlur}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="grid two">
              <div className="field">
                <label htmlFor={`${formId}-email`}>Email *</label>
                <input
                  id={`${formId}-email`}
                  name="email"
                  value={values.email}
                  onChange={onChange}
                  onBlur={onBlur}
                  autoComplete="email"
                  inputMode="email"
                  required
                />
                {touched.email && errors.email ? <p className="error">{errors.email}</p> : null}
              </div>

              <div className="field">
                <label htmlFor={`${formId}-email2`}>Repetir email *</label>
                <input
                  id={`${formId}-email2`}
                  name="email2"
                  value={values.email2}
                  onChange={onChange}
                  onBlur={onBlur}
                  autoComplete="email"
                  inputMode="email"
                  required
                />
                {touched.email2 && errors.email2 ? <p className="error">{errors.email2}</p> : null}
              </div>
            </div>

            <div className="field">
              <label htmlFor={`${formId}-asunto`}>Asunto</label>
              <input id={`${formId}-asunto`} name="asunto" value={values.asunto} onChange={onChange} onBlur={onBlur} />
            </div>

            <div className="field">
              <label htmlFor={`${formId}-mensaje`}>Mensaje *</label>
              <textarea
                id={`${formId}-mensaje`}
                name="mensaje"
                value={values.mensaje}
                onChange={onChange}
                onBlur={onBlur}
                rows={6}
                required
              />
              {touched.mensaje && errors.mensaje ? <p className="error">{errors.mensaje}</p> : null}
            </div>

            <p id={`${formId}-status`} className={`form-status ${status.type}`} role="status" aria-live="polite">
              {status.message}
            </p>

            <button className="btn primary" type="submit" disabled={status.type === 'loading' || hasErrors}>
              Enviar
            </button>

            <p className="muted small">
              Al enviar, aceptás que usemos tus datos sólo para responder a tu consulta.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
