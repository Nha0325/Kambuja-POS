import { Outlet } from "react-router"
import TopMenu from "../components/TopMenu"

function CashierLayout() {
  return (
    <main>
        <TopMenu />
        <div className="bg-gray-100 h-full min-h-screen">
          <Outlet />
        </div>
    </main>
  )
}

export default CashierLayout