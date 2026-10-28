import { Redirect } from 'expo-router';

/** La ruta raíz del grupo de autenticación siempre lleva al inicio de sesión. */
export default function AuthIndex() {
  return <Redirect href="/login" />;
}
