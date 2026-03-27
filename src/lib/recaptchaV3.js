let loadPromise = null
let loadedMode = null

async function waitFor(condition, { timeoutMs = 5000, intervalMs = 50 } = {}) {
  const start = Date.now()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (condition()) return
    if (Date.now() - start > timeoutMs) throw new Error('Timeout waiting for condition')
    await new Promise((r) => setTimeout(r, intervalMs))
  }
}

function getScriptHost() {
  // Override opcional (útil en redes que bloquean www.google.com)
  const envHost = import.meta.env.VITE_RECAPTCHA_SCRIPT_HOST
  if (envHost) return String(envHost)
  // Fallback runtime (para reintento automático)
  if (window.__recaptchaScriptHost) return String(window.__recaptchaScriptHost)
  return 'www.google.com'
}

export function getRecaptchaDiagnostics() {
  const enterprise = isEnterpriseEnabled()
  const host = getScriptHost()
  const configuredKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
  const siteKey = configuredKey || (import.meta.env.DEV ? TEST_SITE_KEY : undefined)
  const path = enterprise ? '/recaptcha/enterprise.js' : '/recaptcha/api.js'

  return {
    enterprise,
    host,
    siteKeyPresent: Boolean(siteKey),
    scriptUrl: siteKey ? `https://${host}${path}?render=${encodeURIComponent(siteKey)}` : null,
    hasScriptTag: Boolean(document.querySelector('script[data-recaptcha="v3"]')),
    hasGrecaptcha: Boolean(window.grecaptcha),
    hasReady: enterprise
      ? typeof window.grecaptcha?.enterprise?.ready === 'function'
      : typeof window.grecaptcha?.ready === 'function',
    hasEnterprise: Boolean(window.grecaptcha?.enterprise),
  }
}

// Claves oficiales de prueba (Google reCAPTCHA) para desarrollo.
// Sirven para pruebas locales y NO deben usarse en producción.
const TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'

function isEnterpriseEnabled() {
  // Se puede forzar Enterprise con VITE_RECAPTCHA_ENTERPRISE=true
  // o mediante un tipo explícito.
  const raw = import.meta.env.VITE_RECAPTCHA_ENTERPRISE
  const type = import.meta.env.VITE_RECAPTCHA_TYPE
  if (String(type || '').toLowerCase() === 'enterprise') return true
  if (raw == null) return false
  return String(raw).toLowerCase() === 'true' || String(raw) === '1'
}

function loadScript(siteKey) {
  const enterprise = isEnterpriseEnabled()
  const desiredMode = enterprise ? 'enterprise' : 'standard'

  // Si cambió el modo, forzamos recarga del script.
  if (loadedMode && loadedMode !== desiredMode) {
    const existing = document.querySelector('script[data-recaptcha="v3"]')
    if (existing) existing.remove()
    loadPromise = null
  }

  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    if (!siteKey) {
      reject(new Error('Missing VITE_RECAPTCHA_SITE_KEY'))
      return
    }

    const existing = document.querySelector('script[data-recaptcha="v3"]')
    if (existing) {
      loadedMode = desiredMode
      resolve()
      return
    }

    const script = document.createElement('script')
    const host = getScriptHost()
    const path = isEnterpriseEnabled() ? '/recaptcha/enterprise.js' : '/recaptcha/api.js'
    script.src = `https://${host}${path}?render=${encodeURIComponent(siteKey)}`
    script.async = true
    script.defer = true
    script.dataset.recaptcha = 'v3'
    script.onload = () => {
      loadedMode = desiredMode
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'))
    document.head.appendChild(script)
  })

  return loadPromise
}

export async function getRecaptchaToken(action) {
  const configuredKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
  const siteKey = configuredKey || (import.meta.env.DEV ? TEST_SITE_KEY : undefined)

  // 1) Cargar el script
  await loadScript(siteKey)

  // 2) Esperar a que inicialice. Si no aparece "ready", reintentar una vez con recaptcha.net
  try {
    await waitFor(
      () =>
        isEnterpriseEnabled()
          ? typeof window.grecaptcha?.enterprise?.ready === 'function'
          : typeof window.grecaptcha?.ready === 'function',
      { timeoutMs: 2500 },
    )
  } catch {
    // Reintento forzando recarga del script
    const existing = document.querySelector('script[data-recaptcha="v3"]')
    if (existing) existing.remove()
    loadPromise = null
    loadedMode = null
    window.__recaptchaScriptHost = getScriptHost() === 'www.google.com' ? 'www.recaptcha.net' : 'www.google.com'
    await loadScript(siteKey)
    await waitFor(
      () =>
        isEnterpriseEnabled()
          ? typeof window.grecaptcha?.enterprise?.ready === 'function'
          : typeof window.grecaptcha?.ready === 'function',
      { timeoutMs: 2500 },
    )
  }

  const enterprise = isEnterpriseEnabled()
  const grecaptchaRoot = window.grecaptcha
  if (!grecaptchaRoot) throw new Error('reCAPTCHA not ready (missing window.grecaptcha)')
  if (enterprise) {
    if (!grecaptchaRoot.enterprise) throw new Error('reCAPTCHA not ready (missing grecaptcha.enterprise)')
    if (typeof grecaptchaRoot.enterprise.ready !== 'function') {
      throw new Error('reCAPTCHA blocked or incomplete (missing grecaptcha.enterprise.ready)')
    }
  } else {
    if (typeof grecaptchaRoot.ready !== 'function') {
      throw new Error('reCAPTCHA blocked or incomplete (missing grecaptcha.ready)')
    }
  }

  const grecaptcha = enterprise ? grecaptchaRoot.enterprise : grecaptchaRoot
  if (typeof grecaptcha?.execute !== 'function') throw new Error('reCAPTCHA not ready (missing grecaptcha.execute)')

  await new Promise((resolve) => (enterprise ? grecaptchaRoot.enterprise.ready(resolve) : grecaptchaRoot.ready(resolve)))
  const token = await grecaptcha.execute(siteKey, { action })
  if (!token) throw new Error('Empty reCAPTCHA token')
  return token
}
