# Bellas Cejas

Sitio Next.js de Bellascejas Academy (Miami + Santiago).

## Desarrollo

```bash
npm install
cp .env.example .env.local   # Neon + AUTH_SECRET; luego npm run seed:admin
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Contenido

Copy fuente en `content/`. Constantes de marca/contacto/nav en `src/lib/site.ts`.

## Notas

- Front público: CSS en `src/app/globals.css` (sin Tailwind)
- Admin `/admin`: JWT + Neon `admin_users` (`/admin/login`)
- Ver `AGENTS.md` para reglas de agentes
