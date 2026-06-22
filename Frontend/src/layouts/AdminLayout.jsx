import { useEffect, useState } from 'react'
import TopMenu from '../components/TopMenu'
import { Outlet } from 'react-router'
import Sidebar from '../components/navigation/AdminSidebar'

const getDefaultSidebarState = () => (
  typeof window === "undefined" ? true : window.innerWidth >= 1024
)

function AdminLayout() {
    const[isShowSidebar, setIsShowSidebar] = useState(getDefaultSidebarState)

    useEffect(() => {
      const handleResize = () => {
        setIsShowSidebar(window.innerWidth >= 1024)
      }

      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }, [])

  return (
    <>
       <div className='min-h-screen overflow-x-hidden'>
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
            <TopMenu onShowSidebar={ () => setIsShowSidebar(!isShowSidebar) } />
            <div className='min-h-screen max-w-full bg-[#f8f9ff] p-3 sm:p-4 lg:p-6'>
              <Outlet />

            </div>
            
          </div>
       </div>
       
       
    </>
  )
}

export default AdminLayout
