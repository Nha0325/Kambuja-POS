import { Route } from "react-router-dom"
import Protected from "../components/Protected"
import CashierLayout from "../layouts/CashierLayout"
import POS from "../pages/cashier/POS"
import RoleAwarePOS from "../pages/cashier/RoleAwarePOS"
import Checkout from "../pages/cashier/Checkout"
import TodaySales from "../pages/cashier/TodaySales"
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
      <Route path="today-sales" element={<TodaySales />} />
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
