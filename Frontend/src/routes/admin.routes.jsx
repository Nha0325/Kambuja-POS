import { Route } from "react-router-dom"
import Protected from "../components/Protected"
import AdminLayout from "../layouts/AdminLayout"
import Home from "../pages/admin/Dashboard"
import Supplier from "../pages/admin/supplier/Supplier"
import CreateSupplier from "../pages/admin/supplier/CreateSupplier"
import EditSupplier from "../pages/admin/supplier/EditSupplier"
import Customer from "../pages/admin/customer/Customer"
import CreateCustomer from "../pages/admin/customer/CreateCustomer"
import EditCustomer from "../pages/admin/customer/EditCustomer"
import Profile from "../pages/profile/Profile"
import Category from "../pages/admin/category/Category"
import CreateCategory from "../pages/admin/category/CreateCategory"
import EditCategory from "../pages/admin/category/EditCategory"
import Product from "../pages/admin/product/Product"
import CreateProduct from "../pages/admin/product/CreateProduct"
import EditProduct from "../pages/admin/product/EditProduct"
import PrintLabel from "../pages/admin/product/PrintLabel"
import Purchase from "../pages/admin/purchase/Purchase"
import CreatePurchase from "../pages/admin/purchase/CreatePurchase"
import User from "../pages/admin/user/Cashiers"
import CreateUser from "../pages/admin/user/CreateCashier"
import EditUser from "../pages/admin/user/EditCashier"
import ListSale from "../pages/sale/ListSale"
import SaleReport from "../pages/admin/report/SaleReport"
import StockReport from "../pages/admin/report/StockReport"
import Inventory from "../pages/admin/inventory/Inventory"
import StockIn from "../pages/admin/inventory/StockIn"
import StockAdjustment from "../pages/admin/inventory/StockAdjustment"
import NotificationChannels from "../pages/admin/notification/NotificationChannels"
import NotificationLogs from "../pages/admin/notification/NotificationLogs"
import ShopSettings from "../pages/admin/ShopSettings"
import { ROLES } from "../utils/role"

const adminElement = (
  <Protected allowedRoles={[ROLES.ADMIN]}>
    <AdminLayout />
  </Protected>
)

export const adminRoutes = (
  <>
    <Route path="/admin" element={adminElement}>
      <Route index element={<Home />} />
      <Route path="dashboard" element={<Home />} />
      <Route path="suppliers" element={<Supplier />} />
      <Route path="suppliers/create" element={<CreateSupplier />} />
      <Route path="suppliers/:id/edit" element={<EditSupplier />} />
      <Route path="customers" element={<Customer />} />
      <Route path="customers/create" element={<CreateCustomer />} />
      <Route path="customers/:id/edit" element={<EditCustomer />} />
      <Route path="profile" element={<Profile />} />
      <Route path="categories" element={<Category />} />
      <Route path="categories/create" element={<CreateCategory />} />
      <Route path="categories/:id/edit" element={<EditCategory />} />
      <Route path="products" element={<Product />} />
      <Route path="products/create" element={<CreateProduct />} />
      <Route path="products/:id/edit" element={<EditProduct />} />
      <Route path="products/print-label" element={<PrintLabel />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="inventory/stock-in" element={<StockIn />} />
      <Route path="inventory/adjust" element={<StockAdjustment />} />
      <Route path="purchases" element={<Purchase />} />
      <Route path="purchases/create" element={<CreatePurchase />} />
      <Route path="cashiers" element={<User />} />
      <Route path="cashiers/create" element={<CreateUser />} />
      <Route path="cashiers/:id/edit" element={<EditUser />} />
      <Route path="sales" element={<ListSale />} />
      <Route path="reports/sales" element={<SaleReport />} />
      <Route path="reports/stock" element={<StockReport />} />
      <Route path="notifications/channels" element={<NotificationChannels />} />
      <Route path="notifications/logs" element={<NotificationLogs />} />
      <Route path="shop-settings" element={<ShopSettings />} />
    </Route>

    <Route element={adminElement}>
      <Route path="/supplier" element={<Supplier />} />
      <Route path="/supplier/create" element={<CreateSupplier />} />
      <Route path="/supplier/edit/:id" element={<EditSupplier />} />
      <Route path="/customer" element={<Customer />} />
      <Route path="/customer/create" element={<CreateCustomer />} />
      <Route path="/customer/edit/:id" element={<EditCustomer />} />
      <Route path="/category" element={<Category />} />
      <Route path="/category/create" element={<CreateCategory />} />
      <Route path="/category/edit/:id" element={<EditCategory />} />
      <Route path="/product" element={<Product />} />
      <Route path="/product/create" element={<CreateProduct />} />
      <Route path="/product/edit/:id" element={<EditProduct />} />
      <Route path="/product/print-label" element={<PrintLabel />} />
      <Route path="/purchase" element={<Purchase />} />
      <Route path="/purchase/create" element={<CreatePurchase />} />
      <Route path="/user" element={<User />} />
      <Route path="/user/create" element={<CreateUser />} />
      <Route path="/user/edit/:id" element={<EditUser />} />
      <Route path="/sale/list" element={<ListSale />} />
      <Route path="/report/sale" element={<SaleReport />} />
      <Route path="/report/stock" element={<StockReport />} />
    </Route>
  </>
)
