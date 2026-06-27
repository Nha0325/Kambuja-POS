import { Navigate, Route } from "react-router-dom"
import Protected from "../components/Protected"
import CashierLayout from "../layouts/CashierLayout"
import POS from "../pages/cashier/POS"
import RoleAwarePOS from "../pages/cashier/RoleAwarePOS"
import Checkout from "../pages/cashier/Checkout"
import HoldBills from "../pages/cashier/HoldBills"
import StockCheck from "../pages/cashier/StockCheck"
import DailyClose from "../pages/cashier/DailyClose"
import SalesHistory from "../pages/cashier/SalesHistory"
import Invoice from "../pages/cashier/Invoice"
import { ROLES } from "../utils/role"

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
      <Route index element={<RoleAwarePOS />} />
    </Route>
    <Route path="/cashier" element={cashierLayout}>
      <Route path="checkout" element={<Checkout />} />
      <Route path="hold-orders" element={<HoldBills />} />
      <Route path="sales-history" element={<SalesHistory />} />
      <Route path="stock-check" element={<StockCheck />} />
      <Route path="my-shift" element={<DailyClose />} />
      <Route path="hold-bills" element={<Navigate to="/cashier/hold-orders" replace />} />
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
