import ngrok from 'ngrok'

function parseArgs(argv) {
  const out = {}
  for (const arg of argv) {
    const m = arg.match(/^--([^=]+)=(.*)$/)
    if (m) out[m[1]] = m[2]
  }
  return out
}

const args = parseArgs(process.argv.slice(2))
const portArg = args.port
const addr = Number((portArg && portArg !== '%npm_config_port%' ? portArg : '') || process.env.TUNNEL_PORT || 5173)
const authtoken = args.authtoken || process.env.NGROK_AUTHTOKEN

if (!Number.isFinite(addr) || addr <= 0) {
  console.error('Invalid port. Use: node scripts/tunnel.mjs --port=5174')
  process.exit(1)
}

if (authtoken) {
  await ngrok.authtoken(authtoken)
}

try {
  // Evita conflictos si quedó un túnel anterior vivo.
  try {
    await ngrok.disconnect()
    await ngrok.kill()
  } catch {
    // ignore
  }

  const url = await ngrok.connect({ addr, name: 'termoar-dev' })
  console.log(url)
  console.log(`Add this domain to reCAPTCHA: ${new URL(url).host}`)
} catch (err) {
  console.error('Failed to start ngrok tunnel.')
  if (!authtoken) {
    console.error('Tip: set NGROK_AUTHTOKEN (ngrok usually requires it).')
  }
  console.error(err)
  process.exit(1)
}

process.on('SIGINT', async () => {
  try {
    await ngrok.disconnect()
    await ngrok.kill()
  } finally {
    process.exit(0)
  }
})
