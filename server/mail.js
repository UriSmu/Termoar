import nodemailer from 'nodemailer'

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function asRow(label, value) {
  return `<tr><td style="padding:8px 10px;border:1px solid #e5e4e7"><strong>${escapeHtml(
    label,
  )}</strong></td><td style="padding:8px 10px;border:1px solid #e5e4e7">${escapeHtml(value)}</td></tr>`
}

function asLine(label, value) {
  if (!value) return ''
  const v = String(value).trim()
  if (!v) return ''
  return `<p style="margin:0 0 6px"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(v)}</p>`
}

export async function sendContactEmail(payload) {
  const to = process.env.CONTACT_TO || 'ventas@termoar.com.ar'

  const isProd = process.env.NODE_ENV === 'production'
  const hasSmtp =
    Boolean(process.env.SMTP_HOST) &&
    Boolean(process.env.SMTP_PORT) &&
    Boolean(process.env.SMTP_USER) &&
    Boolean(process.env.SMTP_PASS) &&
    Boolean(process.env.SMTP_FROM)

  if (!hasSmtp && !isProd) {
    console.log('[mail] SMTP not configured; dev mode log only')
    console.log({ to, replyTo: payload.email, subject: payload.asunto || 'Contacto desde la web', payload })
    return { mode: 'log_only', to }
  }

  const from = requireEnv('SMTP_FROM')

  const transporter = nodemailer.createTransport({
    host: requireEnv('SMTP_HOST'),
    port: Number(requireEnv('SMTP_PORT')),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: requireEnv('SMTP_USER'),
      pass: requireEnv('SMTP_PASS'),
    },
  })

  const subjectBase = payload.asunto ? payload.asunto : 'Contacto desde la web'
  const subject = `[TermoAR] ${subjectBase}`

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.4">
    <h2 style="margin:0 0 12px">Nuevo contacto desde la web</h2>
    ${asLine('Nombre', `${payload.apellido}, ${payload.nombre}`)}
    ${asLine('Empresa', payload.empresa)}
    ${asLine('Teléfono', payload.telefono)}
    ${asLine('Email', payload.email)}
    <div style="height:10px"></div>
    <div style="white-space:pre-wrap">${escapeHtml(payload.mensaje)}</div>
    <div style="height:12px"></div>
    <p style="margin:0;color:#6b6375;font-size:12px">reCAPTCHA: score ${payload.recaptcha?.score ?? '-'} / action ${payload.recaptcha?.action ?? '-'}</p>
  </div>
  `.trim()

  const info = await transporter.sendMail({
    to,
    from,
    replyTo: payload.email,
    subject,
    text: `${payload.nombre} ${payload.apellido}\nEmail: ${payload.email}\nEmpresa: ${payload.empresa || '-'}\nTel: ${payload.telefono || '-'}\nAsunto: ${payload.asunto || '-'}\n\n${payload.mensaje}`,
    html,
  })

  if (!isProd) {
    console.log('[mail] sent', {
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected,
      response: info?.response,
      envelope: info?.envelope,
    })
  }

  return {
    mode: 'smtp',
    to,
    messageId: info?.messageId,
    accepted: info?.accepted,
    rejected: info?.rejected,
    response: info?.response,
  }
}
