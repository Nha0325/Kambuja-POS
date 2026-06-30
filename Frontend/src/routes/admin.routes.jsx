/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
import { Navigate, Route } from "react-router-dom"
const Protected = lazy(() => import("../components/auth/Protected"))
import AdminLayout from "../layouts/AdminLayout"
const Home = lazy(() => import("../pages/admin/dashboard"))
const SupplierCreate = lazy(() => import("../pages/admin/supplier").then(module => ({ default: module.SupplierCreate })))
const SupplierEdit = lazy(() => import("../pages/admin/supplier").then(module => ({ default: module.SupplierEdit })))
const SupplierList = lazy(() => import("../pages/admin/supplier").then(module => ({ default: module.SupplierList })))
const Profile = lazy(() => import("../pages/profile/Profile"))
const CategoryCreate = lazy(() => import("../pages/admin/category").then(module => ({ default: module.CategoryCreate })))
const CategoryEdit = lazy(() => import("../pages/admin/category").then(module => ({ default: module.CategoryEdit })))
const CategoryList = lazy(() => import("../pages/admin/category").then(module => ({ default: module.CategoryList })))
const PrintLabel = lazy(() => import("../pages/admin/product").then(module => ({ default: module.PrintLabel })))
const ProductCreate = lazy(() => import("../pages/admin/product").then(module => ({ default: module.ProductCreate })))
const ProductEdit = lazy(() => import("../pages/admin/product").then(module => ({ default: module.ProductEdit })))
const ProductList = lazy(() => import("../pages/admin/product").then(module => ({ default: module.ProductList })))
const PurchaseCreate = lazy(() => import("../pages/admin/purchase").then(module => ({ default: module.PurchaseCreate })))
const PurchaseList = lazy(() => import("../pages/admin/purchase").then(module => ({ default: module.PurchaseList })))
const CashierCreate = lazy(() => import("../pages/admin/user").then(module => ({ default: module.CashierCreate })))
const CashierEdit = lazy(() => import("../pages/admin/user").then(module => ({ default: module.CashierEdit })))
const CashierList = lazy(() => import("../pages/admin/user").then(module => ({ default: module.CashierList })))
const ListSale = lazy(() => import("../pages/cashier/pos/ListSale"))
const SaleReport = lazy(() => import("../pages/admin/report").then(module => ({ default: module.SaleReport })))
const StockReport = lazy(() => import("../pages/admin/report").then(module => ({ default: module.StockReport })))
const Inventory = lazy(() => import("../pages/admin/inventory").then(module => ({ default: module.Inventory })))
const History = lazy(() => import("../pages/admin/inventory").then(module => ({ default: module.History })))
const NotificationChannels = lazy(() => import("../pages/admin/notification").then(module => ({ default: module.NotificationChannels })))
const NotificationLogs = lazy(() => import("../pages/admin/notification").then(module => ({ default: module.NotificationLogs })))
const ShopSettings = lazy(() => import("../pages/admin/settings"))
import { ROLES } from "../utils/helpers/role"

const adminElement = (
  <Protected allowedRoles={[ROLES.ADMIN]}>
    <AdminLayout />
  </Protected>
)

const stockElement = (
  <Protected allowedRoles={[ROLES.ADMIN]}>
    <AdminLayout />
  </Protected>
)

export const adminRoutes = (
  <>
    <Route path="/admin" element={stockElement}>
      <Route path="inventory" element={<Inventory />} />
      <Route path="inventory/history" element={<History />} />
    </Route>

    <Route path="/admin" element={adminElement}>
      <Route index element={<Home />} />
      <Route path="dashboard" element={<Home />} />
      <Route path="suppliers" element={<SupplierList />} />
      <Route path="suppliers/create" element={<SupplierCreate />} />
      <Route path="suppliers/:id/edit" element={<SupplierEdit />} />
      <Route path="profile" element={<Profile />} />
      <Route path="categories" element={<CategoryList />} />
      <Route path="categories/create" element={<CategoryCreate />} />
      <Route path="categories/:id/edit" element={<CategoryEdit />} />
      <Route path="products" element={<ProductList />} />
      <Route path="products/create" element={<ProductCreate />} />
      <Route path="products/:id/edit" element={<ProductEdit />} />
      <Route path="products/print-label" element={<PrintLabel />} />
      <Route path="purchases" element={<PurchaseList />} />
      <Route path="purchases/create" element={<PurchaseCreate />} />
      <Route path="cashiers" element={<CashierList />} />
      <Route path="cashiers/create" element={<CashierCreate />} />
      <Route path="cashiers/:id/edit" element={<CashierEdit />} />
      <Route path="sales" element={<ListSale />} />
      <Route path="channels" element={<NotificationChannels />} />
      <Route path="logs" element={<NotificationLogs />} />
      <Route path="reports/sales" element={<SaleReport />} />
      <Route path="reports/stock" element={<StockReport />} />
      <Route path="notifications/channels" element={<NotificationChannels />} />
      <Route path="notifications/logs" element={<NotificationLogs />} />
      <Route path="settings" element={<ShopSettings />} />
      <Route path="shop-settings" element={<Navigate to="/admin/settings" replace />} />
    </Route>

    <Route element={adminElement}>
      <Route path="/supplier" element={<SupplierList />} />
      <Route path="/supplier/create" element={<SupplierCreate />} />
      <Route path="/supplier/edit/:id" element={<SupplierEdit />} />
      <Route path="/category" element={<CategoryList />} />
      <Route path="/category/create" element={<CategoryCreate />} />
      <Route path="/category/edit/:id" element={<CategoryEdit />} />
      <Route path="/product" element={<ProductList />} />
      <Route path="/product/create" element={<ProductCreate />} />
      <Route path="/product/edit/:id" element={<ProductEdit />} />
      <Route path="/product/print-label" element={<PrintLabel />} />
      <Route path="/purchase" element={<PurchaseList />} />
      <Route path="/purchase/create" element={<PurchaseCreate />} />
      <Route path="/user" element={<CashierList />} />
      <Route path="/user/create" element={<CashierCreate />} />
      <Route path="/user/edit/:id" element={<CashierEdit />} />
      <Route path="/sale/list" element={<ListSale />} />
      <Route path="/report/sale" element={<SaleReport />} />
      <Route path="/report/stock" element={<StockReport />} />
    </Route>
  </>
)
