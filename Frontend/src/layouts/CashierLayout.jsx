import { useEffect, useState } from "react"
import { Outlet } from "react-router"
import TopMenu from "../components/TopMenu"
import CashierSidebar from "../components/navigation/CashierSidebar"

const getDefaultSidebarState = () => (
  typeof window === "undefined" ? true : window.innerWidth >= 1024
)

function CashierLayout() {
  const [isShowSidebar, setIsShowSidebar] = useState(getDefaultSidebarState)

  useEffect(() => {
    const handleResize = () => {
      setIsShowSidebar(window.innerWidth >= 1024)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden">
        {isShowSidebar && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
            onClick={() => setIsShowSidebar(false)}
          />
        )}
        <CashierSidebar
          isShowSidebar={isShowSidebar}
          onNavigate={() => {
            if (window.innerWidth < 1024) setIsShowSidebar(false)
          }}
        />
        <div className={`${isShowSidebar ? "lg:pl-44" : "lg:pl-0"} min-w-0 max-w-full transition-all duration-300`}>
        <TopMenu onShowSidebar={() => setIsShowSidebar((value) => !value)} />
        <div className="min-h-screen max-w-full bg-gray-100">
          <Outlet />
        </div>
        </div>
    </main>
  )
}

export default CashierLayout
