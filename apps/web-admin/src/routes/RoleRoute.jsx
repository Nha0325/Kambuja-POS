import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../features/auth/store/authStore";

export default function RoleRoute({ allowedRoles }) {
  const user = useAuthStore((state) => state.user);
  return allowedRoles.includes(user?.roleName) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
}
