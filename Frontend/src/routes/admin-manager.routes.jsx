import { Route } from "react-router-dom"
import Protected from "../components/Protected"
import AdminManagerLayout from "../layouts/AdminManagerLayout"
import Dashboard from "../pages/admin-manager/dashboard"
import { CreateShop, EditShop, Shops } from "../pages/admin-manager/shops"
import { Admins, CreateAdmin } from "../pages/admin-manager/admins"
import Reports from "../pages/admin-manager/reports"
import SystemLogs from "../pages/admin-manager/logs"
import Settings from "../pages/admin-manager/settings"
import Stock from "../pages/admin-manager/stock"
import PosAccess from "../pages/admin-manager/access"
import { ROLES } from "../utils/role"

export const adminManagerRoutes = (
  <Route
    path="/admin-manager"
    element={
      <Protected allowedRoles={[ROLES.ADMIN_MANAGER]}>
        <AdminManagerLayout />
      </Protected>
    }
  >
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="shops" element={<Shops />} />
    <Route path="shops/create" element={<CreateShop />} />
    <Route path="shops/:id/edit" element={<EditShop />} />
    <Route path="stock" element={<Stock />} />
    <Route path="pos" element={<PosAccess />} />
    <Route path="admins" element={<Admins />} />
    <Route path="admins/create" element={<CreateAdmin />} />
    <Route path="reports" element={<Reports />} />
    <Route path="system-logs" element={<SystemLogs />} />
    <Route path="settings" element={<Settings />} />
  </Route>
)
