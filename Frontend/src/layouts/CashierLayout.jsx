import { Outlet } from "react-router"
import TopMenu from "../components/TopMenu"
import CashierSidebar from "../components/navigation/CashierSidebar"

function CashierLayout() {
  return (
    <main className="pl-44">
        <CashierSidebar />
        <TopMenu />
        <div className="min-h-screen bg-gray-100">
          <Outlet />
        </div>
    </main>
  )
}

export default CashierLayout
