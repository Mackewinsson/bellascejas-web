# AGENTS.md — Bellascejas

## Propósito

Sitio marketing de **Bellas Cejas / Bellascejas Academy LLC** (Miami + Santiago), reconstruido desde el copy en `content/` con el template Next.js del usuario.

## Stack

- Next.js App Router (boilerplate), React 19
- Público: **vanilla CSS** en `src/app/globals.css` (tema Studio Clean)
- Admin: Tailwind v3 + Shadcn en `/admin` (JWT + `admin_users` en Neon)
- Booking propio: Neon Postgres + Resend (sin Setmore, sin pago online en v1)
- Contenido: Markdown en `content/` vía `src/lib/content.ts` (`gray-matter` + `react-markdown`)

## Marca y datos

Ver también `src/lib/site.ts` (fuente única en código para contacto, booking, nav).

- Booking público: `/reservar` (timezone `America/New_York` / Miami)
- Admin citas: `/admin/citas`, servicios `/admin/servicios`, equipo `/admin/equipo`
- WhatsApp: http://wa.link/661qhl
- Miami: 1460 NW 107th Ave, Suite 28A, Miami, FL 33172
- Santiago: Quinta Normal, San Pablo 4025 — reserva vía WhatsApp Chile (sin slots en v1)

## Booking (v1)

- Schema Neon: `staff`, `services`, `business_hours`, `appointments`
- Seed: `npm run seed:booking` desde `src/data/setmore-prices.json`
- API: `POST /api/booking`, `GET /api/booking/slots`
- Emails: `src/lib/email/booking.ts` (cliente + `ADMIN_EMAIL`)
- Pago: en el salón; estado `confirmed` al reservar
- Env: `NEON_DATABASE_URL`, `RESEND_API_KEY`, `RESEND_FROM`, `ADMIN_EMAIL`

## Styling — dos sistemas (no mezclar)

### Público (`/`, `/servicios/**`, `/reservar`, `/cursos/**`, etc.)
- Solo vanilla CSS (`globals.css`)
- Tokens Pigment Porcelain: `--accent` `#A85A68`, `--background` `#F6F2F3`, display Bodoni Moda, body Sora; images natural aspect (no forced cover crop)
- No Tailwind en componentes bajo `src/components/site/`
- No importar `admin.css` en layouts públicos
- Hero: marca dominante, un headline, una línea, CTAs — sin cards en hero

### Admin (`/admin/**`)
- Tailwind + Shadcn; `admin.css` solo en `src/app/admin/layout.tsx`
- No ampliar `tailwind.config.js` content paths al sitio público
- Shadcn: `npx shadcn@2.5.0 add <name> --yes`

## Contenido

- Inventario: `content/site-map.md`
- **No inventar copy.** Editar `content/*.md` o `src/lib/site.ts`
- Productos: stub `/productos` (sin catálogo en WP fuente)
- **Precios Miami:** seed desde `src/data/setmore-prices.json` ? tabla `services`; UI en `/servicios/miami/precios` con links `/reservar?service=slug`
- Imágenes aún en `bellascejas.com/wp-content` (remotePatterns en `next.config.ts`); rehostear a `/public` en una etapa posterior

## Auth

- Auth admin propio: JWT (cookie httpOnly `bc_admin_token`) + tabla Neon `admin_users`
- Login: `/admin/login` — seed con `npm run seed:admin` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`)
- `src/proxy.ts` protege `/admin/**` excepto `/admin/login`
- El sitio público no requiere cuenta

## Comandos

```bash
npm install
cp .env.example .env.local   # Neon + Resend + AUTH_SECRET
npm run seed:booking
npm run seed:admin
npm run dev
npm run build
```

## Reglas de agentes

1. Preferir Server Components
2. CTAs de reserva Miami ? `/reservar`; Santiago / consultas ? WhatsApp
3. UI etapa actual: moderna, simple, profesional — no copiar estilos WordPress
4. Antes de commit/deploy: `npm run build` limpio
5. No commitear `.env.local` ni credenciales Neon
