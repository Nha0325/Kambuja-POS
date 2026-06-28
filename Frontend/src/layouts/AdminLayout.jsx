import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '../components/navigation/AdminSidebar'
import TopMenu from '../components/navigation/TopMenu'

const pageTitles = [
  ["/admin/suppliers/create", "Create Supplier"],
  ["/admin/suppliers/", "Edit Supplier"],
  ["/admin/suppliers", "Suppliers"],
  ["/admin/categories/create", "Create Category"],
  ["/admin/categories/", "Edit Category"],
  ["/admin/categories", "Categories"],
  ["/admin/products/print-label", "Print Labels"],
  ["/admin/products/create", "Create Product"],
  ["/admin/products/", "Edit Product"],
  ["/admin/products", "Products"],
  ["/admin/inventory/stock-in", "Receive Stock"],
  ["/admin/inventory/adjustment", "Stock Adjustment"],
  ["/admin/inventory/adjust", "Adjustment"],
  ["/admin/inventory", "Stock Overview"],
  ["/admin/purchases/create", "Create Purchase"],
  ["/admin/purchases", "Purchases"],
  ["/admin/cashiers/create", "Create Cashier"],
  ["/admin/cashiers/", "Edit Cashier"],
  ["/admin/cashiers", "Cashiers"],
  ["/admin/sales", "Sale Lists"],
  ["/admin/reports/sales", "Sale Report"],
  ["/admin/reports/stock", "Stock Report"],
  ["/admin/channels", "Channels"],
  ["/admin/logs", "Logs"],
  ["/admin/notifications/channels", "Notification Channels"],
  ["/admin/notifications/logs", "Notification Logs"],
  ["/admin/settings", "Settings"],
  ["/admin/shop-settings", "Shop Settings"],
]

const getPageTitle = (pathname) => (
  pageTitles.find(([path]) => pathname.startsWith(path))?.[1] || "Dashboard"
)

function AdminLayout() {
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
  const sidebarPadding = isExpanded ? "lg:pl-[260px]" : "lg:pl-[72px]"

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
      
      <AdminSidebar
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
          eyebrow="Shop Admin"
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

export default AdminLayout
