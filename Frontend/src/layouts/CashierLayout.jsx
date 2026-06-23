import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router"
import TopMenu from "../components/TopMenu"
import CashierSidebar from "../components/navigation/CashierSidebar"

const getDefaultSidebarState = () => (
  typeof window === "undefined" ? true : window.innerWidth >= 1024
)

const pageTitles = [
  ["/cashier/pos", "POS"],
  ["/cashier/checkout", "Checkout"],
  ["/cashier/sales-today", "Sales Today"],
  ["/cashier/hold-bills", "Hold Bills"],
  ["/cashier/stock-check", "Stock Check"],
  ["/cashier/daily-close", "Daily Close"],
]

const getPageTitle = (pathname) => (
  pageTitles.find(([path]) => pathname.startsWith(path))?.[1] || "Dashboard"
)

function CashierLayout() {
  const [isShowSidebar, setIsShowSidebar] = useState(getDefaultSidebarState)
  const { pathname } = useLocation()

  useEffect(() => {
    const handleResize = () => {
      setIsShowSidebar(window.innerWidth >= 1024)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <>
       <div className='min-h-screen overflow-x-hidden bg-[#f8f9ff] text-[#0b1c30]'>
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
          <div className={`${isShowSidebar  ? 'lg:ml-[260px]':'lg:ml-0'} min-w-0 max-w-full transition-all duration-300`}>
            <TopMenu
              title={getPageTitle(pathname)}
              eyebrow="Shop Cashier"
              onShowSidebar={ () => setIsShowSidebar(!isShowSidebar) }
            />
            <main className='min-h-[calc(100vh-64px)] max-w-full p-3 sm:p-4 lg:p-6'>
              <div className="mx-auto w-full max-w-full min-w-0 xl:max-w-7xl">
                <Outlet />
              </div>
            </main>
            
          </div>
       </div>
    </>
  )
}

export default CashierLayout
