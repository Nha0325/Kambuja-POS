import { Route } from "react-router-dom"
import Protected from "../components/Protected"
import CashierLayout from "../layouts/CashierLayout"
import POS from "../pages/cashier/POS"
import RoleAwarePOS from "../pages/cashier/RoleAwarePOS"
import Checkout from "../pages/cashier/Checkout"
import TodaySales from "../pages/cashier/TodaySales"
import HoldBills from "../pages/cashier/HoldBills"
import StockCheck from "../pages/cashier/StockCheck"
import DailyClose from "../pages/cashier/DailyClose"
import Invoice from "../pages/cashier/Invoice"
import { ROLES } from "../utils/role"

const cashierLayout = (
  <Protected allowedRoles={[ROLES.CASHIER, ROLES.ADMIN]}>
    <CashierLayout />
  </Protected>
)

const posLayout = (
  <Protected allowedRoles={[ROLES.ADMIN_MANAGER, ROLES.CASHIER, ROLES.ADMIN]}>
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
      <Route path="sales-today" element={<TodaySales />} />
      <Route path="hold-bills" element={<HoldBills />} />
      <Route path="stock-check" element={<StockCheck />} />
      <Route path="daily-close" element={<DailyClose />} />
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
