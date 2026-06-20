import { Navigate, createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import PosLayout from "../layouts/PosLayout";
import AddProductPage from "../pages/admin/AddProductPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import CashierListPage from "../pages/admin/CashierListPage";
import CategoryPage from "../pages/admin/CategoryPage";
import CreateCashierPage from "../pages/admin/CreateCashierPage";
import CustomerRecordsPage from "../pages/admin/CustomerRecordsPage";
import NotificationsPage from "../pages/admin/NotificationsPage";
import ProductListPage from "../pages/admin/ProductListPage";
import SalesReportPage from "../pages/admin/SalesReportPage";
import ShopProfilePage from "../pages/admin/ShopProfilePage";
import ShopSettingsPage from "../pages/admin/ShopSettingsPage";
import StockManagementPage from "../pages/admin/StockManagementPage";
import StockMovementPage from "../pages/admin/StockMovementPage";
import LoginPage from "../pages/auth/LoginPage";
import NotFoundPage from "../pages/error/NotFoundPage";
import UnauthorizedPage from "../pages/error/UnauthorizedPage";
import PaymentPage from "../pages/pos/PaymentPage";
import PosSalePage from "../pages/pos/PosSalePage";
import ReceiptPage from "../pages/pos/ReceiptPage";
import TodaySalesPage from "../pages/pos/TodaySalesPage";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";

export const router = createBrowserRouter([
  { element: <AuthLayout />, children: [{ path: "/login", element: <LoginPage /> }] },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={["ADMIN"]} />,
        children: [{
          path: "/admin",
          element: <AdminLayout />,
          children: [
            { index: true, element: <Navigate to="/admin/dashboard" replace /> },
            { path: "dashboard", element: <AdminDashboardPage /> },
            { path: "shop", element: <ShopProfilePage /> },
            { path: "products", element: <ProductListPage /> },
            { path: "products/create", element: <AddProductPage /> },
            { path: "categories", element: <CategoryPage /> },
            { path: "inventory", element: <StockManagementPage /> },
            { path: "stock-movements", element: <StockMovementPage /> },
            { path: "cashiers", element: <CashierListPage /> },
            { path: "cashiers/create", element: <CreateCashierPage /> },
            { path: "reports/sales", element: <SalesReportPage /> },
            { path: "customers", element: <CustomerRecordsPage /> },
            { path: "notifications", element: <NotificationsPage /> },
            { path: "settings", element: <ShopSettingsPage /> },
          ],
        }],
      },
      {
        element: <RoleRoute allowedRoles={["CASHIER"]} />,
        children: [{
          path: "/pos",
          element: <PosLayout />,
          children: [
            { index: true, element: <Navigate to="/pos/sale" replace /> },
            { path: "sale", element: <PosSalePage /> },
            { path: "payment", element: <PaymentPage /> },
            { path: "receipt", element: <ReceiptPage /> },
            { path: "today-sales", element: <TodaySalesPage /> },
          ],
        }],
      },
    ],
  },
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
