import { useEffect, useState } from 'react'
import TopMenu from '../components/TopMenu'
import { Outlet, useLocation } from 'react-router'
import Sidebar from '../components/navigation/AdminSidebar'

const getDefaultSidebarState = () => (
  typeof window === "undefined" ? true : window.innerWidth >= 1024
)

const pageTitles = [
  ["/admin/suppliers/create", "Create Supplier"],
  ["/admin/suppliers/", "Edit Supplier"],
  ["/admin/suppliers", "Suppliers"],
  ["/admin/customers/create", "Create Customer"],
  ["/admin/customers/", "Edit Customer"],
  ["/admin/customers", "Customers"],
  ["/admin/categories/create", "Create Category"],
  ["/admin/categories/", "Edit Category"],
  ["/admin/categories", "Categories"],
  ["/admin/products/print-label", "Print Labels"],
  ["/admin/products/create", "Create Product"],
  ["/admin/products/", "Edit Product"],
  ["/admin/products", "Products"],
  ["/admin/inventory/stock-in", "Stock In"],
  ["/admin/inventory/adjust", "Stock Adjustment"],
  ["/admin/inventory", "Inventory"],
  ["/admin/purchases/create", "Create Purchase"],
  ["/admin/purchases", "Purchases"],
  ["/admin/cashiers/create", "Create Cashier"],
  ["/admin/cashiers/", "Edit Cashier"],
  ["/admin/cashiers", "Cashiers"],
  ["/admin/sales", "Sales"],
  ["/admin/reports/sales", "Sale Report"],
  ["/admin/reports/stock", "Stock Report"],
  ["/admin/notifications/channels", "Notification Channels"],
  ["/admin/notifications/logs", "Notification Logs"],
  ["/admin/shop-settings", "Shop Settings"],
]

const getPageTitle = (pathname) => (
  pageTitles.find(([path]) => pathname.startsWith(path))?.[1] || "Dashboard"
)

function AdminLayout() {
    const[isShowSidebar, setIsShowSidebar] = useState(getDefaultSidebarState)
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
          <Sidebar
            isShowSidebar={isShowSidebar}
            onNavigate={() => {
              if (window.innerWidth < 1024) setIsShowSidebar(false)
            }}
          />
          <div className={`${isShowSidebar  ? 'lg:ml-[260px]':'lg:ml-0'} min-w-0 max-w-full transition-all duration-300`}>
            <TopMenu
              title={getPageTitle(pathname)}
              eyebrow="Shop Admin"
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

export default AdminLayout
