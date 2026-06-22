import { Route } from "react-router-dom"
import Protected from "../components/Protected"
import AdminManagerLayout from "../layouts/AdminManagerLayout"
import Dashboard from "../pages/admin-manager/Dashboard"
import Shops from "../pages/admin-manager/Shops"
import CreateShop from "../pages/admin-manager/CreateShop"
import EditShop from "../pages/admin-manager/EditShop"
import Admins from "../pages/admin-manager/Admins"
import CreateAdmin from "../pages/admin-manager/CreateAdmin"
import Reports from "../pages/admin-manager/Reports"
import SystemLogs from "../pages/admin-manager/SystemLogs"
import Settings from "../pages/admin-manager/Settings"
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
    <Route path="admins" element={<Admins />} />
    <Route path="admins/create" element={<CreateAdmin />} />
    <Route path="reports" element={<Reports />} />
    <Route path="system-logs" element={<SystemLogs />} />
    <Route path="settings" element={<Settings />} />
  </Route>
)
