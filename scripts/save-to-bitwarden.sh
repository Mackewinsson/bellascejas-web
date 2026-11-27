#!/usr/bin/env bash
set -e

echo "=== Sincronización con Bitwarden ==="

if [ -z "$BW_SESSION" ]; then
  echo "Desbloqueando caja fuerte de Bitwarden..."
  export BW_SESSION="$(bw unlock --raw)"
fi

echo "Caja fuerte desbloqueada. Guardando credenciales..."

# 1. Bellas Cejas - Admin Backoffice
cat << 'EOF' | bw encode | bw create item --session "$BW_SESSION" > /dev/null
{
  "type": 1,
  "name": "Bellas Cejas - Admin Backoffice",
  "notes": "Panel de administración Next.js.\nAUTH_SECRET=bellascejas-prod-auth-secret-89472910",
  "login": {
    "username": "admin@bellascejas.com",
    "password": "Bc0ebc5a75c00b0374d455dcfd89420bca!9",
    "uris": [
      {
        "match": null,
        "uri": "https://www.bellascejas.com/admin/login"
      }
    ]
  }
}
EOF
echo "✔ Guardado: Bellas Cejas - Admin Backoffice"

# 2. Bellas Cejas - PostgreSQL (Coolify Hetzner)
cat << 'EOF' | bw encode | bw create item --session "$BW_SESSION" > /dev/null
{
  "type": 1,
  "name": "Bellas Cejas - PostgreSQL (Coolify Hetzner)",
  "notes": "Base de datos PostgreSQL en Coolify.\nResource ID: eqpajwmkhgi9jgcevuzsxsws\nInternal URI: postgresql://postgres:OmIEvp6nYu4skJaaFAIQmB3z4q9J1X5qBCKysV3C9mEKvLpSOjUw2KGSIC6uS0W0@eqpajwmkhgi9jgcevuzsxsws:5432/bellascejas",
  "login": {
    "username": "postgres",
    "password": "OmIEvp6nYu4skJaaFAIQmB3z4q9J1X5qBCKysV3C9mEKvLpSOjUw2KGSIC6uS0W0",
    "uris": [
      {
        "match": null,
        "uri": "postgresql://eqpajwmkhgi9jgcevuzsxsws:5432/bellascejas"
      }
    ]
  }
}
EOF
echo "✔ Guardado: Bellas Cejas - PostgreSQL (Coolify Hetzner)"

# 3. Coolify Dashboard - Hetzner
cat << 'EOF' | bw encode | bw create item --session "$BW_SESSION" > /dev/null
{
  "type": 1,
  "name": "Coolify Dashboard - Hetzner VPS",
  "notes": "Instancia Coolify en Hetzner (178.105.118.167)\nBackup .env maestro en /data/coolify/source/.env",
  "login": {
    "username": "mackewinsson@gmail.com",
    "uris": [
      {
        "match": null,
        "uri": "https://coolify.mackewinsson.com"
      }
    ]
  }
}
EOF
echo "✔ Guardado: Coolify Dashboard - Hetzner VPS"

echo ""
echo "¡Todas las credenciales han sido guardadas y sincronizadas en tu Bitwarden!"
