import { Navigate, Route, Routes } from "react-router-dom"
import Loading from "../components/Loading"
import useCurrent from "../hooks/auth/useCurrent"
import NotFound from "../pages/NotFound"
import Unauthorized from "../pages/Unauthorized"
import PrintLabelPage from "../pages/product/PrintLabelPage"
import Protected from "../components/Protected"
import { homeForRole, ROLES } from "../utils/role"
import { authRoutes } from "./auth.routes"
import { adminManagerRoutes } from "./admin-manager.routes"
import { adminRoutes } from "./admin.routes"
import { cashierRoutes } from "./cashier.routes"

function RoleHome() {
  const { data, isLoading } = useCurrent()
  if (isLoading) return <Loading />
  return <Navigate to={data ? homeForRole(data.role) : "/login"} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleHome />} />
      {authRoutes}
      {adminManagerRoutes}
      {adminRoutes}
      {cashierRoutes}
      <Route
        path="/product/print-label-page"
        element={
          <Protected allowedRoles={[ROLES.ADMIN]}>
            <PrintLabelPage />
          </Protected>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
