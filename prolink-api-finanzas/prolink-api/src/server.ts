import mongoose from 'mongoose';
import { app } from './app';
import { env } from './config/env';

async function main(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  const server = app.listen(env.PORT, () => console.log(`ProLink API escuchando en :${env.PORT}`));
  const shutdown = (): void => { server.close(() => void mongoose.disconnect()); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
main().catch((e) => { console.error('Fallo al iniciar', e); process.exit(1); });
