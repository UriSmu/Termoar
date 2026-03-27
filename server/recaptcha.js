const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

// Secret oficial de prueba (Google reCAPTCHA) para desarrollo.
// NO usar en producción.
const TEST_SECRET_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'

export async function verifyRecaptchaV3({ token, expectedAction, minScore, remoteip }) {
  const enterpriseProjectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID
  if (enterpriseProjectId) {
    return verifyRecaptchaEnterprise({
      token,
      expectedAction,
      minScore,
      remoteip,
      projectId: enterpriseProjectId,
    })
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY || (process.env.NODE_ENV !== 'production' ? TEST_SECRET_KEY : '')
  if (!secret) {
    return { ok: false, details: { reason: 'missing_secret' } }
  }

  if (!token || typeof token !== 'string') {
    return { ok: false, details: { reason: 'missing_token' } }
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  })

  if (remoteip) body.set('remoteip', remoteip)

  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    return { ok: false, details: { reason: 'verify_http_error', status: res.status } }
  }

  const data = await res.json()

  const isProd = process.env.NODE_ENV === 'production'
  const isTestKeyResponse = data?.hostname === 'testkey.google.com'

  // Las keys oficiales de prueba pueden no incluir score/action.
  // En desarrollo aceptamos success=true para permitir probar el flujo local.
  if (!isProd && isTestKeyResponse) {
    return {
      ok: Boolean(data?.success),
      details: {
        success: Boolean(data?.success),
        score: data?.score,
        action: data?.action,
        hostname: data?.hostname,
        challenge_ts: data?.challenge_ts,
        error_codes: data?.['error-codes'],
        expectedAction,
        minScore,
        devMode: true,
        testKey: true,
      },
    }
  }

  const ok =
    Boolean(data?.success) &&
    typeof data?.score === 'number' &&
    data.score >= minScore &&
    (!expectedAction || data.action === expectedAction)

  return {
    ok,
    details: {
      success: Boolean(data?.success),
      score: data?.score,
      action: data?.action,
      hostname: data?.hostname,
      challenge_ts: data?.challenge_ts,
      error_codes: data?.['error-codes'],
      expectedAction,
      minScore,
    },
  }
}

async function verifyRecaptchaEnterprise({ token, expectedAction, minScore, remoteip, projectId }) {
  const hasCreds = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS) || Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  if (!hasCreds) {
    return {
      ok: false,
      details: {
        reason: 'missing_service_account',
        hint: 'Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path (recommended) or set GOOGLE_SERVICE_ACCOUNT_JSON.',
      },
    }
  }

  if (!token || typeof token !== 'string') {
    return { ok: false, details: { reason: 'missing_token' } }
  }

  // API: https://recaptchaenterprise.googleapis.com/v1/projects/{project}/assessments
  // Autenticación: OAuth2 con service account (Authorization: Bearer)
  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/assessments`

  const accessToken = await getGoogleAccessToken({
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  })

  if (!accessToken) {
    return { ok: false, details: { reason: 'missing_access_token' } }
  }

  const siteKey = process.env.RECAPTCHA_ENTERPRISE_SITE_KEY || process.env.VITE_RECAPTCHA_SITE_KEY
  if (!siteKey) {
    return {
      ok: false,
      details: {
        reason: 'missing_site_key',
        hint: 'Set RECAPTCHA_ENTERPRISE_SITE_KEY (recommended) to your reCAPTCHA Enterprise site key (public key).',
      },
    }
  }

  const body = {
    event: {
      token,
      siteKey,
      expectedAction,
      userIpAddress: normalizeIp(remoteip) || undefined,
      userAgent: undefined,
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let text = ''
    try {
      text = await res.text()
    } catch {
      text = ''
    }
    return { ok: false, details: { reason: 'enterprise_http_error', status: res.status, body: text } }
  }

  const data = await res.json()

  const tokenProps = data?.tokenProperties
  const riskScore = data?.riskAnalysis?.score
  const reasons = data?.riskAnalysis?.reasons
  const invalidReason = tokenProps?.invalidReason

  const ok =
    tokenProps?.valid === true &&
    (!expectedAction || tokenProps?.action === expectedAction) &&
    typeof riskScore === 'number' &&
    riskScore >= minScore

  return {
    ok,
    details: {
      enterprise: true,
      valid: tokenProps?.valid,
      action: tokenProps?.action,
      hostname: tokenProps?.hostname,
      invalidReason,
      score: riskScore,
      reasons,
      expectedAction,
      minScore,
    },
  }
}

async function getGoogleAccessToken({ scope }) {
  const creds = await loadServiceAccountCredentials()
  if (!creds) return ''

  const now = Math.floor(Date.now() / 1000)
  const iat = now - 5
  const exp = now + 60 * 10

  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: creds.client_email,
    scope,
    aud: creds.token_uri || 'https://oauth2.googleapis.com/token',
    iat,
    exp,
  }

  const signedJwt = await signJwtRs256({ header, payload, privateKeyPem: creds.private_key })

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: signedJwt,
  })

  const res = await fetch(creds.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    let text = ''
    try {
      text = await res.text()
    } catch {
      text = ''
    }
    if (String(process.env.DEBUG_MAIL || '').toLowerCase() === 'true') {
      console.warn('[recaptcha] oauth token error', res.status, text)
    }
    return ''
  }

  const data = await res.json()
  return typeof data?.access_token === 'string' ? data.access_token : ''
}

async function loadServiceAccountCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
      return parsed
    } catch {
      return null
    }
  }

  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!p) return null
  try {
    const fs = await import('node:fs/promises')
    const raw = await fs.readFile(p, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function signJwtRs256({ header, payload, privateKeyPem }) {
  const { createSign } = await import('node:crypto')
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const sign = createSign('RSA-SHA256')
  sign.update(signingInput)
  sign.end()
  const signature = sign.sign(privateKeyPem)
  return `${signingInput}.${base64UrlEncodeBuffer(signature)}`
}

function base64UrlEncode(str) {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlEncodeBuffer(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function normalizeIp(ip) {
  if (!ip) return ''
  const raw = String(ip)
  // Express a veces reporta IPv6-mapped IPv4 como ::ffff:127.0.0.1
  if (raw.startsWith('::ffff:')) return raw.slice('::ffff:'.length)
  // Localhost IPv6
  if (raw === '::1') return '127.0.0.1'
  // Eliminar puerto si viniera (no debería)
  return raw.split(':')[0]
}
