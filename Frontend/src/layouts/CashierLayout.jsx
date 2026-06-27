import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import TopMenu from "../components/TopMenu"
import CashierSidebar from "../components/navigation/CashierSidebar"

const pageTitles = [
  ["/cashier/pos", "POS"],
  ["/cashier/checkout", "Checkout"],
  ["/cashier/sales-history", "Sales History"],
  ["/cashier/sales-today", "Sales History"],
  ["/cashier/hold-orders", "Hold Orders"],
  ["/cashier/hold-bills", "Hold Orders"],
  ["/cashier/stock-check", "Stock Check"],
  ["/cashier/my-shift", "My Shift"],
  ["/cashier/daily-close", "My Shift"],
]

const getPageTitle = (pathname) => (
  pageTitles.find(([path]) => pathname.startsWith(path))?.[1] || "Dashboard"
)

function CashierLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  })
  const location = useLocation()

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove('dark');
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isExpanded = isPinned || isHovered
  const sidebarPadding = isExpanded ? "lg:pl-[240px]" : "lg:pl-[72px]"

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#020617] dark:bg-[#09090b] dark:text-[#f8fafc] transition-colors duration-300">
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <CashierSidebar
        isMobileOpen={isMobileOpen}
        isExpanded={isExpanded}
        onHover={(state) => setIsHovered(state)}
        onNavigate={() => {
          if (window.innerWidth < 1024) setIsMobileOpen(false)
        }}
      />
      
      <div className={`${sidebarPadding} min-w-0 max-w-full overflow-x-hidden transition-all duration-300`}>
        <TopMenu
          title={getPageTitle(location.pathname)}
          eyebrow="Shop Cashier"
          onShowSidebar={() => {
            if (window.innerWidth < 1024) {
              setIsMobileOpen(!isMobileOpen)
            } else {
              setIsPinned(!isPinned)
            }
          }}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />
        <main className="min-h-[calc(100vh-64px)] max-w-full p-4 lg:p-8">
          <div className="w-full max-w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default CashierLayout
