import { Route } from "react-router-dom"
import Protected from "../components/Protected"
import AdminLayout from "../layouts/AdminLayout"
import Home from "../pages/admin/dashboard"
import { SupplierCreate, SupplierEdit, SupplierList } from "../pages/admin/supplier"
import { CustomerCreate, CustomerEdit, CustomerList } from "../pages/admin/customer"
import Profile from "../pages/profile/Profile"
import { CategoryCreate, CategoryEdit, CategoryList } from "../pages/admin/category"
import { PrintLabel, ProductCreate, ProductEdit, ProductList } from "../pages/admin/product"
import { PurchaseCreate, PurchaseList } from "../pages/admin/purchase"
import { CashierCreate, CashierEdit, CashierList } from "../pages/admin/user"
import ListSale from "../pages/sale/ListSale"
import { SaleReport, StockReport } from "../pages/admin/report"
import { Inventory, StockAdjustment, StockIn } from "../pages/admin/inventory"
import { NotificationChannels, NotificationLogs } from "../pages/admin/notification"
import ShopSettings from "../pages/admin/settings"
import { ROLES } from "../utils/role"

const adminElement = (
  <Protected allowedRoles={[ROLES.ADMIN]}>
    <AdminLayout />
  </Protected>
)

const stockElement = (
  <Protected allowedRoles={[ROLES.ADMIN_MANAGER, ROLES.ADMIN]}>
    <AdminLayout />
  </Protected>
)

export const adminRoutes = (
  <>
    <Route path="/admin" element={stockElement}>
      <Route path="inventory" element={<Inventory />} />
      <Route path="inventory/stock-in" element={<StockIn />} />
      <Route path="inventory/adjust" element={<StockAdjustment />} />
    </Route>

    <Route path="/admin" element={adminElement}>
      <Route index element={<Home />} />
      <Route path="dashboard" element={<Home />} />
      <Route path="suppliers" element={<SupplierList />} />
      <Route path="suppliers/create" element={<SupplierCreate />} />
      <Route path="suppliers/:id/edit" element={<SupplierEdit />} />
      <Route path="customers" element={<CustomerList />} />
      <Route path="customers/create" element={<CustomerCreate />} />
      <Route path="customers/:id/edit" element={<CustomerEdit />} />
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
      <Route path="reports/sales" element={<SaleReport />} />
      <Route path="reports/stock" element={<StockReport />} />
      <Route path="notifications/channels" element={<NotificationChannels />} />
      <Route path="notifications/logs" element={<NotificationLogs />} />
      <Route path="shop-settings" element={<ShopSettings />} />
    </Route>

    <Route element={adminElement}>
      <Route path="/supplier" element={<SupplierList />} />
      <Route path="/supplier/create" element={<SupplierCreate />} />
      <Route path="/supplier/edit/:id" element={<SupplierEdit />} />
      <Route path="/customer" element={<CustomerList />} />
      <Route path="/customer/create" element={<CustomerCreate />} />
      <Route path="/customer/edit/:id" element={<CustomerEdit />} />
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
