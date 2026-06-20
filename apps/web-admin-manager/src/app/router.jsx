import { Navigate, createBrowserRouter } from "react-router-dom";
import AdminManagerLayout from "../layouts/AdminManagerLayout";
import AuthLayout from "../layouts/AuthLayout";
import AdminListPage from "../pages/admins/AdminListPage";
import CreateAdminPage from "../pages/admins/CreateAdminPage";
import LoginPage from "../pages/auth/LoginPage";
import AdminManagerDashboardPage from "../pages/dashboard/AdminManagerDashboardPage";
import NotFoundPage from "../pages/error/NotFoundPage";
import UnauthorizedPage from "../pages/error/UnauthorizedPage";
import ProvinceListPage from "../pages/location/ProvinceListPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import AllSalesReportPage from "../pages/reports/AllSalesReportPage";
import AllStockReportPage from "../pages/reports/AllStockReportPage";
import SystemSettingsPage from "../pages/settings/SystemSettingsPage";
import AllShopsPage from "../pages/shops/AllShopsPage";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <RoleRoute allowedRoles={["ADMIN_MANAGER"]} />,
      children: [{
        element: <AdminManagerLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <AdminManagerDashboardPage /> },
          { path: "/admins", element: <AdminListPage /> },
          { path: "/admins/create", element: <CreateAdminPage /> },
          { path: "/shops", element: <AllShopsPage /> },
          { path: "/location/provinces", element: <ProvinceListPage /> },
          { path: "/reports/sales", element: <AllSalesReportPage /> },
          { path: "/reports/stock", element: <AllStockReportPage /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/settings", element: <SystemSettingsPage /> },
        ],
      }],
    }],
  },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
