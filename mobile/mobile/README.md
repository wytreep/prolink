# ProLink Mobile

Aplicación móvil de ProLink para estudiantes que buscan prácticas profesionales. Está construida con **React Native + Expo SDK 58**, **TypeScript** y **Expo Router**.

La app cubre los cuatro pilares del proyecto:

- **Autenticación**: inicio de sesión, registro y modo demo.
- **Ofertas y postulaciones**: exploración, filtros, guardados y seguimiento de procesos.
- **Hoja de vida**: edición por secciones, vista previa y exportación a PDF.
- **Finanzas personales**: regla 50/30/20, movimientos, metas de ahorro y funcionamiento offline.

> El backend actual implementa autenticación y finanzas. Las ofertas, postulaciones y la hoja de vida funcionan con datos locales para que el flujo completo pueda revisarse sin API.

## Requisitos

- Node.js 20 o superior.
- npm.
- Expo Go en el celular, o un emulador de Android/iOS.
- Opcional: la API de ProLink corriendo en el puerto `4000` (ver `SETUP_BACKEND.md`).

## Instalación

```bash
cd mobile
npm install
```

## Ejecución

```bash
npm start
```

Luego escanea el código QR con **Expo Go** o elige un emulador. También puedes usar:

```bash
npm run android
npm run ios
```

Para una revisión rápida desde el computador puedes usar `npm run web`. La experiencia está diseñada para móvil, pero la vista web permite validar pantallas y flujos sin emulador.

## Modo demo

En la pantalla de inicio de sesión pulsa **Probar en modo demo**. Se carga el usuario:

- **Nombre**: Laura Gómez
- **Correo**: laura.gomez@uniajc.edu.co

El modo demo incluye ofertas, postulaciones, hoja de vida, movimientos y metas de ejemplo. Todos los datos se guardan en el dispositivo y quedan aislados de las cuentas reales.

## Conexión con la API

La URL se resuelve en este orden:

1. `EXPO_PUBLIC_API_URL`, si está definida.
2. El host de Metro en el puerto `4000` (útil en un celular conectado a la misma red).
3. `http://10.0.2.2:4000/api/v1` en el emulador de Android.
4. `http://localhost:4000/api/v1` en iOS y web.

Crea un archivo `.env` a partir de `.env.example`:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000/api/v1
```

Reinicia Metro después de cambiar variables de entorno:

```bash
npx expo start -c
```

Para probar con la API, crea una cuenta desde la app o usa un usuario registrado en el backend. En `SETUP_BACKEND.md` se usa como ejemplo:

- **Correo**: `edwin@test.com`
- **Contraseña**: `Clave12345`

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia Metro / Expo. |
| `npm run android` | Abre la app en Android. |
| `npm run ios` | Abre la app en iOS. |
| `npm run web` | Abre la app en el navegador (vista de apoyo). |
| `npm run typecheck` | Verifica TypeScript con `tsc --noEmit`. |
| `npm run lint` | Ejecuta ESLint con la configuración de Expo. |
| `npx expo-doctor` | Diagnostica dependencias y configuración. |

## Estructura

```text
mobile/
├── src/
│   ├── app/                  # Rutas de Expo Router
│   │   ├── (auth)/           # Login y registro
│   │   ├── (tabs)/           # Inicio, ofertas, finanzas y perfil
│   │   ├── ofertas/          # Detalle y guardadas
│   │   ├── finanzas/         # Nuevo movimiento, historial, regla y metas
│   │   ├── cv/               # Hoja de vida y edición
│   │   └── +not-found.tsx
│   ├── components/           # Componentes reutilizables y UI base
│   ├── context/              # Auth, CV, ofertas y finanzas
│   ├── data/                 # Ofertas, empresas y datos demo
│   ├── lib/                  # API, storage, formato y presupuesto
│   ├── theme.ts              # Paleta, tipografía y espaciados
│   └── types.ts              # Tipos compartidos
├── app.json
├── .env.example
└── package.json
```

## Persistencia y modo offline

- El token se guarda con **expo-secure-store** en nativo y `localStorage` en web.
- Los datos se separan por usuario con claves `prolink.*:<scope>`.
- Ofertas guardadas, postulaciones, CV y metas se guardan con **AsyncStorage**.
- Finanzas usa la API cuando hay sesión y conexión. Si falla o no hay red, el movimiento se guarda localmente con un `clientId` UUID y se sincroniza después con `POST /finance/transactions/sync`.
- La app muestra avisos de pendientes y permite sincronizar manualmente desde Inicio y Finanzas.

## Finanzas

La regla 50/30/20 se calcula sobre los ingresos del mes:

| Bloque | Porcentaje | Ejemplos |
| --- | --- | --- |
| Necesidades | 50% | Arriendo, transporte, mercado, servicios |
| Deseos | 30% | Salidas, suscripciones, gustos |
| Ahorro | 20% | Metas, imprevistos, fondo de emergencia |

La pantalla de finanzas permite cambiar de mes, registrar ingresos y gastos, revisar el detalle por categoría, gestionar metas y consultar el historial.

## Hoja de vida

La hoja de vida se edita por secciones y calcula un porcentaje de completitud. Desde la vista principal se puede generar un PDF con `expo-print`, renombrarlo con el nombre del usuario y compartirlo con `expo-sharing`. En web se abre el diálogo de impresión del navegador con el CV en una vista aislada, para guardarlo como PDF.

## Notas de desarrollo

- Las rutas viven en `src/app/`; el resto del código está fuera de esa carpeta.
- El tema centraliza colores, tipografía, radios y sombras en `src/theme.ts`.
- Los íconos usan `@expo/vector-icons` (Ionicons).
- Si agregas una librería con código nativo, necesitarás un development build; Expo Go solo incluye los módulos preinstalados.
