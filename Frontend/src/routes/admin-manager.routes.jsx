import { Navigate, Route } from "react-router-dom"
import Protected from "../components/Protected"
import AdminManagerLayout from "../layouts/AdminManagerLayout"
import Dashboard from "../pages/admin-manager/dashboard"
import { CreateShop, EditShop, Shops } from "../pages/admin-manager/shops"
import { Admins, CreateAdmin } from "../pages/admin-manager/admins"
import Reports from "../pages/admin-manager/reports"
import SystemLogs from "../pages/admin-manager/logs"
import SystemHealth from "../pages/admin-manager/health"
import Settings from "../pages/admin-manager/settings"
import Stock from "../pages/admin-manager/stock"
import Alerts from "../pages/admin-manager/alerts"
import { CreateLocation, EditLocation, Locations } from "../pages/admin-manager/locations"
import { Subscriptions } from "../pages/admin-manager/subscriptions"
import PosAccess from "../pages/admin-manager/access"

import ProductList from "../pages/admin-manager/products/ProductList"
import ProductDetail from "../pages/admin-manager/products/ProductDetail"
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
    <Route path="admin-owners" element={<Admins />} />
    <Route path="admin-owners/create" element={<CreateAdmin />} />
    <Route path="admin-owners/:id/edit" element={<CreateAdmin />} />
    <Route path="admins" element={<Navigate to="/admin-manager/admin-owners" replace />} />
    <Route path="admins/create" element={<Navigate to="/admin-manager/admin-owners/create" replace />} />
    <Route path="reports" element={<Reports />} />
    <Route path="locations" element={<Locations />} />
    <Route path="locations/create" element={<CreateLocation />} />
    <Route path="locations/:id/edit" element={<EditLocation />} />
    <Route path="subscriptions" element={<Subscriptions />} />
    <Route path="system-logs" element={<SystemLogs />} />
    <Route path="system-health" element={<SystemHealth />} />
    <Route path="alerts" element={<Alerts />} />
    <Route path="settings" element={<Settings />} />
    <Route path="access" element={<PosAccess />} />
    <Route path="products" element={<ProductList />} />
    <Route path="products/:id" element={<ProductDetail />} />
  </Route>
)
