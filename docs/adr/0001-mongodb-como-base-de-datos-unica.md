# ADR-0001: MongoDB Atlas como base de datos única (sin SQLite en el cliente)

- **Estado:** Aceptada
- **Contexto:** La propuesta inicial contemplaba persistencia dual: SQLite en el dispositivo (offline) y MongoDB Atlas en la nube. Esto implica dos esquemas y una lógica de sincronización más compleja.
- **Decisión:** Usar MongoDB Atlas (Mongoose) como única base de datos del sistema y una caché local con AsyncStorage para el modo offline (CV, ofertas guardadas y gastos pendientes), sincronizada al recuperar la conexión.
- **Consecuencias:** (+) Un solo esquema y menor complejidad de sincronización, adecuado al alcance académico. (−) El modo offline se limita a los datos cacheados; no hay consultas relacionales locales.
