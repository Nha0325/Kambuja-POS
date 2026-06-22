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
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-violet-100 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={onShowSidebar}
          className="rounded-full p-2 text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-800"
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
        <h2 className="truncate text-xl font-semibold text-slate-900">{getPageTitle(location.pathname)}</h2>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden items-center gap-4 text-slate-500 sm:flex">
          <button type="button" className="transition-colors hover:text-violet-700" aria-label="Notifications">
            <FaBell />
          </button>
          <button type="button" className="transition-colors hover:text-violet-700" aria-label="Help">
            <FaCircleQuestion />
          </button>
        </div>

        <div className="h-8 w-px bg-violet-100" />

        <div ref={accountMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsAccountOpen((value) => !value)}
            className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-80"
          >
            <div className="hidden text-right sm:block">
              <p className="max-w-36 truncate text-sm font-semibold leading-tight text-slate-900">{user?.username || "Admin User"}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-violet-700">Super Administrator</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-100 bg-violet-50 text-violet-700">
              <FaUserShield />
            </div>
          </button>

          {isAccountOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-xl shadow-violet-100/60">
              <div className="border-b border-violet-100 p-4">
                <p className="truncate text-sm font-semibold text-slate-900">{user?.username || "Admin User"}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{user?.email || "No email"}</p>
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

const getDefaultSidebarState = () => (
  typeof window === "undefined" ? true : window.innerWidth >= 1024
)

function AdminManagerLayout() {
  const [isShowSidebar, setIsShowSidebar] = useState(getDefaultSidebarState)

  useEffect(() => {
    const handleResize = () => {
      setIsShowSidebar(window.innerWidth >= 1024)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 text-slate-900">
      {isShowSidebar && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setIsShowSidebar(false)}
        />
      )}
      <AdminManagerSidebar
        isShowSidebar={isShowSidebar}
        onNavigate={() => {
          if (window.innerWidth < 1024) setIsShowSidebar(false)
        }}
      />
      <div className={`${isShowSidebar ? "lg:ml-[260px]" : "lg:ml-0"} min-w-0 max-w-full transition-all duration-300`}>
        <AdminManagerTopBar onShowSidebar={() => setIsShowSidebar((value) => !value)} />
        <main className="min-h-[calc(100vh-64px)] max-w-full px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
          <div className="mx-auto w-full max-w-full min-w-0 xl:max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminManagerLayout
