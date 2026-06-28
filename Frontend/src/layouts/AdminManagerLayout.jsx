import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import AdminManagerSidebar from "../components/navigation/AdminManagerSidebar"
import TopMenu from "../components/navigation/TopMenu"
import ConfirmProvider from "../components/ui/ConfirmProvider"

const pageTitles = [
  ["/admin-manager/shops/create", "Create Shop"],
  ["/admin-manager/shops/", "Edit Shop"],
  ["/admin-manager/shops", "Shops"],
  ["/admin-manager/admin-owners/create", "Create Admin Owner"],
  ["/admin-manager/admin-owners", "Admin Owners"],
  ["/admin-manager/admins/create", "Create Admin Owner"],
  ["/admin-manager/admins", "Admin Owners"],
  ["/admin-manager/stock", "Stock Overview"],
  ["/admin-manager/pos", "POS"],
  ["/admin-manager/reports", "Platform Reports"],
  ["/admin-manager/system-logs", "System Logs"],
  ["/admin-manager/system-health", "System Health"],
  ["/admin-manager/alerts", "Alerts"],
  ["/admin-manager/settings", "Platform Settings"],
]

const getPageTitle = (pathname) => (
  pageTitles.find(([path]) => pathname.startsWith(path))?.[1] || "Platform Dashboard"
)

function AdminManagerLayout() {
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
    <ConfirmProvider>
      <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#020617] dark:bg-[#09090b] dark:text-[#f8fafc] transition-colors duration-300">
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <AdminManagerSidebar
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
          eyebrow="Platform Manager"
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

export default AdminManagerLayout
