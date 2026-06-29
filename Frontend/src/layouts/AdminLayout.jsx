import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '../components/navigation/AdminSidebar'
import TopMenu from '../components/navigation/TopMenu'
import ConfirmProvider from '../components/ui/ConfirmProvider'
import { useTranslation } from "react-i18next"

const pageTitles = [
  ["/admin/suppliers/create", "create_new_supplier"],
  ["/admin/suppliers/", "edit_supplier"],
  ["/admin/suppliers", "suppliers"],
  ["/admin/categories/create", "create_new_category"],
  ["/admin/categories/", "edit_category"],
  ["/admin/categories", "categories"],
  ["/admin/products/print-label", "print_barcode_qr_label"],
  ["/admin/products/create", "create_new_product"],
  ["/admin/products/", "edit_product"],
  ["/admin/products", "products"],
  ["/admin/inventory/stock-in", "receive_stock"],
  ["/admin/inventory/adjustment", "stock_adjustment"],
  ["/admin/inventory/adjust", "stock_adjustment"],
  ["/admin/inventory", "stock_overview"],
  ["/admin/purchases/create", "create_purchase"],
  ["/admin/purchases", "purchases"],
  ["/admin/cashiers/create", "create_new_cashier"],
  ["/admin/cashiers/", "edit_cashier"],
  ["/admin/cashiers", "cashiers"],
  ["/admin/sales", "view_all_sales"],
  ["/admin/reports/sales", "sales_report"],
  ["/admin/reports/stock", "stock_report"],
  ["/admin/channels", "notification_channels"],
  ["/admin/logs", "notification_logs"],
  ["/admin/notifications/channels", "notification_channels"],
  ["/admin/notifications/logs", "notification_logs"],
  ["/admin/settings", "shop_settings"],
  ["/admin/shop-settings", "shop_settings"],
]

const getPageTitleKey = (pathname) => (
  pageTitles.find(([path]) => pathname.startsWith(path))?.[1] || "dashboard"
)

function AdminLayout() {
  const { t } = useTranslation()
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
  const sidebarPadding = isExpanded ? "lg:pl-[260px]" : "lg:pl-[72px]"

  return (
    <ConfirmProvider>
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] dark:bg-[#09090b] dark:text-[#f8fafc] transition-colors duration-300">
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        isExpanded={isExpanded}
        onHover={(state) => setIsHovered(state)}
        onNavigate={() => {
          if (window.innerWidth < 1024) setIsMobileOpen(false)
        }}
      />
      
      <div className={`${sidebarPadding} min-w-0 max-w-full transition-all duration-300`}>
        <TopMenu
          title={t(getPageTitleKey(location.pathname))}
          eyebrow={t('shop_admin')}
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
    </ConfirmProvider>
  )
}

export default AdminLayout
