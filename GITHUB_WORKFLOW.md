# Instrucciones para subir el backend a GitHub (repositorio privado)

## 1. Estructura del repositorio privado (si no existe aún)

```
prolink/                          # Root del repo
├── backend/                       # API Node/Express/TypeScript (EPIC-07)
│   ├── src/
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .gitignore
├── mobile/                        # App React Native + Expo (próximo)
├── docs/                          # Documentación (Taller 1, ADRs, etc.)
├── .github/
│   └── workflows/                 # CI/CD (tests, lint)
├── .gitignore                     # Global
└── README.md                      # Descripción del proyecto
```

## 2. Pasos para subir el código

### Opción A: Si el repo ya existe

```bash
# Clonar
git clone https://github.com/wytreep/prolink.git
cd prolink

# Crear carpeta backend si no existe
mkdir -p backend

# Descomprimir el código en backend/
tar -xzf prolink-api-finanzas.tar.gz
mv prolink-api/* backend/
rmdir prolink-api

# Asegurarse de que el .gitignore está en su lugar
# (el código ya incluye uno, pero verificar que no commitee node_modules)

# Commitear y pushear
git add .
git commit -m "feat(backend): agregar EPIC-07 Módulo Finanzas 50/30/20 con auth y sync offline"
git push origin main
```

### Opción B: Si no existe aún

```bash
# Crear repo desde CLI de GitHub (si tienes gh instalado)
gh repo create prolink --private --clone
cd prolink

# Descomprimir
mkdir -p backend
tar -xzf prolink-api-finanzas.tar.gz
mv prolink-api/* backend/
rmdir prolink-api

# Crear archivo .gitignore global
cat > .gitignore <<'IGNORE'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Build
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
*.log
npm-debug.log*
yarn-debug.log*
IGNORE

# README inicial
cat > README.md <<'README'
# ProLink

Portal móvil de empleabilidad, habilidades y finanzas personales para estudiantes universitarios.

**Stack:** React Native + Expo (frontend) | Node.js + Express + TypeScript (backend) | MongoDB Atlas

**Módulos:**
- Prácticas (búsqueda y postulación)
- Brecha de habilidades (skill-gap)
- Finanzas personales (presupuesto 50/30/20 con modo offline)

**Equipo:** NOVAFORCE (Ángel A. Angulo, Ronaldo Castro, Edwin A. Carabalí, N. Sebastián Ampudia)

---

## Inicio rápido

### Backend

```bash
cd backend
npm i
cp .env.example .env
# Rellenar .env con MONGODB_URI y JWT_SECRET
npm run dev  # http://localhost:4000
```

### Mobile (próximo avance)

```bash
cd mobile
npm i
npx expo start
```

---

Para detalles, ver [SETUP_BACKEND.md](./backend/SETUP_BACKEND.md).
README

# Subir al repo
git add .
git commit -m "chore: agregar estructura inicial y módulo Finanzas (EPIC-07)"
git push -u origin main
```

## 3. Configurar CI/CD (GitHub Actions)

Crear `.github/workflows/test.yml`:

```yaml
name: Tests & Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
```

## 4. Proteger la rama main

En GitHub:
1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. ✓ Require status checks to pass before merging
4. ✓ Require pull request reviews before merging (opcional)

## 5. Asignar en Jira

Actualizar los ítems en Jira (proyecto PRL):
- **EPIC-07:** "Módulo Finanzas 50/30/20 con sincronización offline"
  - **Story EPIC-07-1:** "Backend: autenticación JWT y CRUD de transacciones" → **DONE** (Edwin)
  - **Story EPIC-07-2:** "Backend: lógica 50/30/20 y resumen mensual" → **DONE** (Edwin)
  - **Story EPIC-07-3:** "Mobile: login y dashboard" → **IN PROGRESS** (Edwin, próxima)
  - Etc.

---

**Notas:**
- El repositorio privado es para desarrollo colaborativo
- El repositorio público (prolink-PL) es para portafolio; sincronizarlo después del final del semestre
- Para desplegar: Railway, Render o Fly.io aceptan Node.js gratis con límites
