import { lazy } from "react"
import { Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
const Loading = lazy(() => import("../components/ui/Loading"))
import useCurrent from "../hooks/auth/useCurrent"
const NotFound = lazy(() => import("../pages/NotFound"))
const Unauthorized = lazy(() => import("../pages/Unauthorized"))
const PrintLabelPage = lazy(() => import("../pages/admin/product").then(module => ({ default: module.PrintLabelPage })))
const Protected = lazy(() => import("../components/auth/Protected"))
import { homeForRole, ROLES } from "../utils/helpers/role"
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
    <Suspense fallback={<Loading />}>
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
    </Suspense>
  )
}

export default AppRoutes
