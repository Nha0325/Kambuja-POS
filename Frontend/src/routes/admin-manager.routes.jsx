/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
import { Navigate, Route } from "react-router-dom"
const Protected = lazy(() => import("../components/auth/Protected"))
import AdminManagerLayout from "../layouts/AdminManagerLayout"
const Dashboard = lazy(() => import("../pages/admin-manager/dashboard"))
const CreateShop = lazy(() => import("../pages/admin-manager/shops").then(module => ({ default: module.CreateShop })))
const EditShop = lazy(() => import("../pages/admin-manager/shops").then(module => ({ default: module.EditShop })))
const Shops = lazy(() => import("../pages/admin-manager/shops").then(module => ({ default: module.Shops })))
const Admins = lazy(() => import("../pages/admin-manager/admins").then(module => ({ default: module.Admins })))
const CreateAdmin = lazy(() => import("../pages/admin-manager/admins").then(module => ({ default: module.CreateAdmin })))
const Reports = lazy(() => import("../pages/admin-manager/reports"))
const SystemLogs = lazy(() => import("../pages/admin-manager/logs"))
const SystemHealth = lazy(() => import("../pages/admin-manager/health"))
const Settings = lazy(() => import("../pages/admin-manager/settings"))
const Stock = lazy(() => import("../pages/admin-manager/stock"))
const Alerts = lazy(() => import("../pages/admin-manager/alerts"))
const CreateLocation = lazy(() => import("../pages/admin-manager/locations").then(module => ({ default: module.CreateLocation })))
const EditLocation = lazy(() => import("../pages/admin-manager/locations").then(module => ({ default: module.EditLocation })))
const Locations = lazy(() => import("../pages/admin-manager/locations").then(module => ({ default: module.Locations })))
const Subscriptions = lazy(() => import("../pages/admin-manager/subscriptions").then(module => ({ default: module.Subscriptions })))
const PosAccess = lazy(() => import("../pages/admin-manager/access"))

const ProductList = lazy(() => import("../pages/admin-manager/products/ProductList"))
const ProductDetail = lazy(() => import("../pages/admin-manager/products/ProductDetail"))
import { ROLES } from "../utils/helpers/role"

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
