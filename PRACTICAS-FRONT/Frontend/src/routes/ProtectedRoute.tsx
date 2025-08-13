// PRACTICAS-FRONT/Frontend/src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../context/useAuth';

type Props = { allowedRoles?: string[] };

function matchRole(user: any, allowed: string[]) {
  if (!user) return false;
  const need = allowed.map((r) => r.toLowerCase().trim());
  const flags = new Set<string>();
  if (user.esAdmin) flags.add('admin');
  if (user.esNomina) flags.add('nomina');
  if (user.esJefe) flags.add('jefe');
  const arr = (user.roles ?? []).map((r: string) => r.toLowerCase().trim());
  return need.some((r) => flags.has(r) || arr.includes(r));
}

export default function ProtectedRoute({ allowedRoles = [] }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // o tu spinner

  if (matchRole(user, allowedRoles)) return <Outlet />;

  return <Navigate to="/unauthorized" replace state={{ from: location }} />;
}