import { useEffect, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  FaBars,
  FaBell,
  FaCircleQuestion,
  FaRightFromBracket,
  FaUserShield,
} from "react-icons/fa6"
import AdminManagerSidebar from "../components/navigation/AdminManagerSidebar"
import useCurrent from "../hooks/auth/useCurrent"
import useSignout from "../hooks/auth/useSignout"

const pageTitles = [
  ["/admin-manager/shops/create", "Create Shop"],
  ["/admin-manager/shops/", "Edit Shop"],
  ["/admin-manager/shops", "Shops"],
  ["/admin-manager/admins/create", "Create Admin"],
  ["/admin-manager/admins", "Admin Accounts"],
  ["/admin-manager/reports", "Platform Reports"],
  ["/admin-manager/system-logs", "System Logs"],
  ["/admin-manager/settings", "Platform Settings"],
]

const getPageTitle = (pathname) => (
  pageTitles.find(([path]) => pathname.startsWith(path))?.[1] || "Platform Dashboard"
)

function AdminManagerTopBar({ onShowSidebar }) {
  const { data: user } = useCurrent()
  const { signout } = useSignout()
  const navigate = useNavigate()
  const location = useLocation()
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const accountMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    const res = await signout()
    if (res) navigate("/login")
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-300 bg-[#f8f9fa] px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={onShowSidebar}
          className="rounded-full p-2 text-gray-600 transition-colors hover:bg-[#e7e8e9] hover:text-gray-950"
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
        <h2 className="truncate text-xl font-bold text-gray-950">{getPageTitle(location.pathname)}</h2>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden items-center gap-4 text-gray-600 sm:flex">
          <button type="button" className="transition-colors hover:text-gray-950" aria-label="Notifications">
            <FaBell />
          </button>
          <button type="button" className="transition-colors hover:text-gray-950" aria-label="Help">
            <FaCircleQuestion />
          </button>
        </div>

        <div className="h-8 w-px bg-gray-300" />

        <div ref={accountMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsAccountOpen((value) => !value)}
            className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-80"
          >
            <div className="hidden text-right sm:block">
              <p className="max-w-36 truncate text-sm font-semibold leading-tight text-gray-950">{user?.username || "Admin User"}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">Super Administrator</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-[#edeeef] text-gray-600">
              <FaUserShield />
            </div>
          </button>

          {isAccountOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-lg">
              <div className="border-b border-gray-200 p-4">
                <p className="truncate text-sm font-semibold text-gray-950">{user?.username || "Admin User"}</p>
                <p className="mt-1 truncate text-xs text-gray-500">{user?.email || "No email"}</p>
              </div>
              <button
                onClick={handleSignOut}
                type="button"
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <FaRightFromBracket />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function AdminManagerLayout() {
  const [isShowSidebar, setIsShowSidebar] = useState(true)

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-950">
      <AdminManagerSidebar isShowSidebar={isShowSidebar} />
      <div className={`${isShowSidebar ? "lg:ml-[260px]" : "lg:ml-0"} min-w-0 transition-all duration-300`}>
        <AdminManagerTopBar onShowSidebar={() => setIsShowSidebar((value) => !value)} />
        <main className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminManagerLayout
