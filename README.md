# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

# Termometría Argentina — Web

## Desarrollo

- Frontend (Vite): `npm run dev`
- Backend (API + reCAPTCHA + email): `npm run dev:server`

### Probar reCAPTCHA v3 “en local” (Opción 2: túnel)

Alternativa simple (recomendado para local): en modo desarrollo, si no configurás keys, la app usa las claves oficiales
de prueba de Google reCAPTCHA v3 automáticamente. En producción, configurá tus keys reales.

1) Levantá frontend y backend:

- `npm run dev`
- `npm run dev:server`

2) Revisá en la consola de Vite cuál fue el puerto (por ejemplo `http://localhost:5174`).

3) Abrí un túnel al puerto del frontend:

- Si Vite está en 5173:
	- `npm run dev:tunnel`
	- o `npm run dev:tunnel --port=5173`

- Si Vite quedó en 5174:
	- `npm run dev:tunnel --port=5174`

Si ngrok te pide autenticación, creá un authtoken y ejecutá:

- `setx NGROK_AUTHTOKEN "TU_TOKEN"`

(Luego reabrí la terminal y volvé a correr `npm run dev:tunnel --port=5174`.)

ngrok te va a mostrar una URL pública (ej: `https://xxxx.ngrok-free.app`).

4) En Google reCAPTCHA (v3) agregá el dominio del túnel (solo hostname):

- `xxxx.ngrok-free.app`

5) Usá esa URL pública para abrir la web y probar el formulario.

Notas:
- Si el dominio de ngrok cambia, tenés que actualizarlo en reCAPTCHA.
- El backend puede necesitar `CORS_ORIGIN` apuntando a esa URL pública (ver `.env.example`).

El frontend llama a `/api/contact`. En desarrollo, Vite proxya `/api/*` a `http://localhost:8787`.

## Variables de entorno

Duplicar `.env.example` a `.env` y completar:

- `VITE_RECAPTCHA_SITE_KEY` (reCAPTCHA v3, frontend)
- `RECAPTCHA_SECRET_KEY` (reCAPTCHA v3, backend)
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Producción (VPS)

Recomendado: Nginx (reverse proxy) + Node (server) + PM2.

- `npm run build` genera `dist/`.
- El backend corre con `npm run start` (por default escucha `PORT=8787`).
- Nginx sirve el `dist/` y proxya `/api/` al backend.
