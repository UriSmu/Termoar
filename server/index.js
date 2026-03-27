import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { sendContactEmail } from './mail.js'
import { verifyRecaptchaV3 } from './recaptcha.js'

const app = express()

const PORT = Number(process.env.PORT || 8787)

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) || true,
  }),
)
app.use(express.json({ limit: '200kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/contact', async (req, res) => {
  try {
    if (String(process.env.DEBUG_MAIL || '').toLowerCase() === 'true') {
      console.log('[contact] request', {
        ip: req.ip,
        hasToken: Boolean(req.body?.recaptchaToken),
        email: req.body?.email,
      })
    }

    const {
      nombre,
      apellido,
      empresa,
      telefono,
      email,
      email2,
      asunto,
      mensaje,
      recaptchaToken,
    } = req.body || {}

    if (!nombre?.trim() || !apellido?.trim() || !email?.trim() || !email2?.trim() || !mensaje?.trim()) {
      return res.status(400).json({ ok: false, error: 'missing_required_fields' })
    }

    const emailNorm = String(email).trim()
    const email2Norm = String(email2).trim()
    if (emailNorm !== email2Norm) {
      return res.status(400).json({ ok: false, error: 'emails_do_not_match' })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return res.status(400).json({ ok: false, error: 'invalid_email' })
    }

    const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || 0.5)
    const recaptcha = await verifyRecaptchaV3({
      token: recaptchaToken,
      expectedAction: 'contact',
      minScore,
      remoteip: req.ip,
    })

    if (!recaptcha.ok) {
      return res.status(403).json({ ok: false, error: 'recaptcha_failed', details: recaptcha.details })
    }

    const mailResult = await sendContactEmail({
      nombre: String(nombre).trim(),
      apellido: String(apellido).trim(),
      empresa: empresa ? String(empresa).trim() : '',
      telefono: telefono ? String(telefono).trim() : '',
      email: emailNorm,
      asunto: asunto ? String(asunto).trim() : '',
      mensaje: String(mensaje).trim(),
      recaptcha: recaptcha.details,
    })

    const debugMailEnabled = String(process.env.DEBUG_MAIL || '').toLowerCase() === 'true'
    if (debugMailEnabled) {
      res.json({ ok: true, debugMail: mailResult ?? null })
      return
    }

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: 'server_error' })
  }
})

app.listen(PORT, () => {
  console.log(`[server] listening on :${PORT}`)
})
