import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import TopMenu from "../components/navigation/TopMenu"
import CashierSidebar from "../components/navigation/CashierSidebar"
import CashierBottomNav from "../components/navigation/CashierBottomNav"
import ConfirmProvider from "../components/ui/ConfirmProvider"
import { useTranslation } from "react-i18next";

const pageTitles = [
  ["/cashier/pos", "pos_page"],
  ["/cashier/checkout", "checkout"],
  ["/cashier/sales-history", "sales_history"],
  ["/cashier/sales-today", "sales_history"],
  ["/cashier/hold-orders", "hold_orders"],
  ["/cashier/hold-bills", "hold_orders"],
  ["/cashier/stock-check", "stock_check"],
  ["/cashier/my-shift", "my_shift"],
  ["/cashier/daily-close", "my_shift"],
]

const getPageTitleKey = (pathname) => (
  pageTitles.find(([path]) => pathname.startsWith(path))?.[1] || "dashboard"
)

function CashierLayout() {
  const { t } = useTranslation();
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

  const isExpanded = isMobileOpen || isPinned || isHovered
  const sidebarPadding = isExpanded ? "lg:pl-[240px]" : "lg:pl-[72px]"

  return (
    <ConfirmProvider>
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] dark:bg-[#09090b] dark:text-[#f8fafc] transition-colors duration-300">
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-[60] bg-slate-950/30 lg:hidden"
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
      
      <div className={`${sidebarPadding} min-w-0 max-w-full transition-all duration-300 pb-16 lg:pb-0 print:pb-0 print:pl-0`}>
        <TopMenu
          title={t(getPageTitleKey(location.pathname))}
          eyebrow={t('shop_cashier')}
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
        <main className="min-h-[calc(100vh-64px)] max-w-full p-2 md:p-4 lg:p-6 print:p-0 print:min-h-0">
          <div className="w-full max-w-full min-w-0">
            <Outlet />
          </div>
        </main>
        <CashierBottomNav />
      </div>
    </div>
    </ConfirmProvider>
  )
}

export default CashierLayout
