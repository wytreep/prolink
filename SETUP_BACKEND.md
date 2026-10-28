# ProLink API — Segundo Avance: Módulo Finanzas (EPIC-07)

## Inicio rápido

### Prerequisitos
- Node.js 18+
- MongoDB Atlas (cluster + usuario con minimo privilegio)

### Instalación

```bash
# 1. Descomprimir
tar -xzf prolink-api-finanzas.tar.gz
cd prolink-api

# 2. Instalar dependencias
npm i

# 3. Crear .env (copiar de .env.example y rellenar)
cp .env.example .env
# Editar .env:
# - MONGODB_URI: tu string de conexión de Atlas
# - JWT_SECRET: generar con: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 4. Arrancar en desarrollo
npm run dev
```

Cuando veas "ProLink API escuchando en :4000", el servidor está listo.

## Flujo de prueba (PowerShell)

```powershell
# 1. Salud
curl http://localhost:4000/api/v1/health

# 2. Registrarse
$reg = @{
  name = "Edwin"
  email = "edwin@test.com"
  password = "Clave12345"
} | ConvertTo-Json
$res = curl -Method Post http://localhost:4000/api/v1/auth/register `
  -ContentType 'application/json' -Body $reg | ConvertFrom-Json
$token = $res.token

# 3. Registrar ingreso
$ing = @{
  clientId = [guid]::NewGuid().ToString()
  type = "income"
  amountCop = 1000000
  description = "Mesada octubre"
  date = (Get-Date).ToString('o')
} | ConvertTo-Json
curl -Method Post http://localhost:4000/api/v1/finance/transactions `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType 'application/json' -Body $ing

# 4. Registrar gasto (needs)
$gas = @{
  clientId = [guid]::NewGuid().ToString()
  type = "expense"
  bucket = "needs"
  amountCop = 400000
  description = "Arriendo"
  date = (Get-Date).ToString('o')
} | ConvertTo-Json
curl -Method Post http://localhost:4000/api/v1/finance/transactions `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType 'application/json' -Body $gas

# 5. Resumen 50/30/20 (mes actual)
curl "http://localhost:4000/api/v1/finance/summary?month=2026-10" `
  -Headers @{ Authorization = "Bearer $token" } | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

## Estructura del código

```
src/
├── config/          # Variables de entorno validadas
├── models/          # Esquemas Mongoose (User, Transaction)
├── services/        # Lógica pura (50/30/20, sin BD)
├── controllers/     # Handlers de rutas (validación, llamadas a modelos)
├── routes/          # Endpoints REST
├── middleware/      # Auth, errores, validación
└── utils/           # Helpers (AppError, asyncHandler)
```

## Rutas disponibles

### Autenticación (sin token)
- `POST /api/v1/auth/register` — Crear cuenta
- `POST /api/v1/auth/login` — Obtener token JWT

### Finanzas (requieren `Authorization: Bearer <token>`)
- `POST /api/v1/finance/transactions` — Registrar un movimiento
- `POST /api/v1/finance/transactions/sync` — Sincronizar lote offline (hasta 100)
- `GET /api/v1/finance/transactions?month=YYYY-MM` — Listar movimientos del mes
- `GET /api/v1/finance/summary?month=YYYY-MM` — Resumen 50/30/20

## Decisiones de diseño

| Aspecto | Decisión | Justificación |
|---|---|---|
| **Montos** | Enteros en COP | Sin errores de punto flotante |
| **Offline** | UUID (`clientId`) por movimiento | Upsert idempotente en sincronización |
| **Zona horaria** | UTC-5 fijo (Colombia) | Exacto; sin horario de verano |
| **JWT** | 1 hora sin refresh | Más simple para MVP; refresh en siguiente sprint |
| **Presupuesto** | Ahorro absorbe residuo | Las tres metas suman exactamente el ingreso |

## Pruebas

```bash
npm test
```

Corre 4 pruebas unitarias de la lógica 50/30/20 (cálculo de metas, estados).

## Logs y debugging

Para ver peticiones HTTP en desarrollo, instala `morgan`:
```bash
npm i -D morgan
# Luego agrega a src/app.ts:
import morgan from 'morgan';
app.use(morgan('dev'));
```

## Siguientes pasos

1. **App Expo:** login, dashboard 50/30/20, formulario con cola offline
2. **Otros módulos:** prácticas y skill-gap con una función cada uno
3. **CI/CD:** GitHub Actions para tests y deploy a Railway/Render

---

**Equipo NOVAFORCE** • Prolink • Oct 2026
