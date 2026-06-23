import { useState } from 'react'
import TopMenu from '../components/TopMenu'
import { Outlet } from 'react-router'
import Sidebar from '../components/Sidebar'

function AdminLayout() {
    const[isShowSidebar, setIsShowSidebar] = useState(true)
  return (
    <>
       <div className='flex items-start'>
          <Sidebar isShowSidebar={isShowSidebar} />
          <div className={`${isShowSidebar  ? 'ml-[233px]':'ml-0'} grow transition-all duration-300`}>
            <TopMenu onShowSidebar={ () => setIsShowSidebar(!isShowSidebar) } />
            <div className='bg-gray-100 h-full min-h-screen p-5'>
              <Outlet />

            </div>
            
          </div>
       </div>
       
       
    </>
  )
}

export default AdminLayout
