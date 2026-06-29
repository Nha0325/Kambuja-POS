/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
import { Navigate, Route } from "react-router-dom"
const Protected = lazy(() => import("../components/auth/Protected"))
import CashierLayout from "../layouts/CashierLayout"
const POS = lazy(() => import("../pages/cashier/pos/POS"))
const Invoice = lazy(() => import("../pages/cashier/pos/Invoice"))
const StockCheck = lazy(() => import("../pages/cashier/StockCheck"))
const DailyClose = lazy(() => import("../pages/cashier/DailyClose"))
const SalesHistory = lazy(() => import("../pages/cashier/SalesHistory"))
import { ROLES } from "../utils/helpers/role"

const cashierLayout = (
  <Protected allowedRoles={[ROLES.CASHIER]}>
    <CashierLayout />
  </Protected>
)

const posLayout = (
  <Protected allowedRoles={[ROLES.ADMIN, ROLES.CASHIER]}>
    <CashierLayout />
  </Protected>
)

export const cashierRoutes = (
  <>
    <Route path="/cashier/pos" element={posLayout}>
      <Route index element={<POS />} />
    </Route>
    <Route path="/cashier" element={cashierLayout}>
      <Route path="checkout" element={<Navigate to="/cashier/pos" replace />} />
      <Route path="sales-history" element={<SalesHistory />} />
      <Route path="stock-check" element={<StockCheck />} />
      <Route path="my-shift" element={<DailyClose />} />
      <Route path="sales-today" element={<Navigate to="/cashier/sales-history" replace />} />
      <Route path="daily-close" element={<Navigate to="/cashier/my-shift" replace />} />
    </Route>
    <Route
      path="/cashier/invoice/:id"
      element={
        <Protected allowedRoles={[ROLES.CASHIER, ROLES.ADMIN]}>
          <Invoice />
        </Protected>
      }
    />
    <Route
      path="/sale/invoice/:id"
      element={
        <Protected allowedRoles={[ROLES.CASHIER, ROLES.ADMIN]}>
          <Invoice />
        </Protected>
      }
    />
    <Route path="/sale/pos" element={cashierLayout}>
      <Route index element={<POS />} />
    </Route>
  </>
)
