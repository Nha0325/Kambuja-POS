import { FaBars } from "react-icons/fa6";
import { GiTwoCoins } from "react-icons/gi";
import { FaGear } from "react-icons/fa6";
import { TbLogout2 } from "react-icons/tb";
import { MdEmail } from "react-icons/md";
import { LuSearch, LuBell, LuSun, LuMoon } from "react-icons/lu";
import useCurrent from "../hooks/auth/useCurrent";
import useSignout from "../hooks/auth/useSignout";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { ROLES, normalizeRole } from "../utils/role";
import { adminManagerService } from "../services/adminManager.service";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

function TopMenu({ onShowSidebar, title, isDark, onToggleTheme }) {
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en')
  const accountMenuRef = useRef(null)
  const { data: user } = useCurrent()
  const { signout } = useSignout()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  
  const isCashier = normalizeRole(user?.role) === ROLES.CASHIER

  const username = user?.username || "User"
  const email = user?.email || "No email"

  // Distinguish between the Admin layout and Cashier layout
  const isAdminShell = !pathname.startsWith('/cashier')

  useEffect(() => {
    const handleLanguageChange = () => setLanguage(localStorage.getItem('language') || 'en')
    window.addEventListener('languagechange', handleLanguageChange)
    return () => window.removeEventListener('languagechange', handleLanguageChange)
  }, [])

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  const notifMenuRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifs(true);
      const [notifsRes, countRes] = await Promise.all([
        adminManagerService.getNotifications({ limit: 5, read: false }),
        adminManagerService.getUnreadNotificationsCount()
      ]);
      if (notifsRes.data?.success) {
        const payload = notifsRes.data?.data || notifsRes.data?.result || notifsRes.data || [];
        setNotifications(Array.isArray(payload) ? payload : (payload.alerts || []));
      }
      if (countRes.data?.success) setUnreadCount(countRes.data?.result?.unreadNotifications || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingNotifs(false);
    }
  };

  const isAdminManagerShell = pathname.startsWith('/admin-manager')

  useEffect(() => {
    if (!isAdminManagerShell) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    const handleRefetch = () => fetchNotifications();
    window.addEventListener("refetchNotifications", handleRefetch);
    return () => {
      clearInterval(interval);
      window.removeEventListener("refetchNotifications", handleRefetch);
    };
  }, [isAdminManagerShell]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) setIsAccountOpen(false);
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) setIsNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    await adminManagerService.markAllNotificationsAsRead();
    fetchNotifications();
    window.dispatchEvent(new Event("refetchAlerts"));
  };

  const handleMarkRead = async (id) => {
    await adminManagerService.markNotificationAsRead(id);
    fetchNotifications();
    window.dispatchEvent(new Event("refetchAlerts"));
    navigate(`/admin-manager/alerts?alertId=${id}`);
    setIsNotifOpen(false);
  };

  const handleOpenNotifs = () => {
    if (!isNotifOpen) {
      fetchNotifications();
    }
    setIsNotifOpen(!isNotifOpen);
  };

  const handleSignOut = async () => {
    const res = await signout()
    if (res) {
      navigate('/login')
    }
  }

  // Variables moved up

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full min-w-0 items-center justify-between gap-3 border-b border-[#e5e7eb] bg-white/95 px-4 sm:px-6 backdrop-blur transition-colors dark:border-[#27272a] dark:bg-[#09090b]/95">
      <div className="flex min-w-0 items-center gap-3 w-1/3">
        {onShowSidebar && (
          <button
            onClick={onShowSidebar || undefined}
            type="button"
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 ${!isAdminShell && "dark:text-[#F8FAFC] dark:hover:bg-[#1A1D22]"}`}
            aria-label="Toggle sidebar"
          >
            <FaBars className="text-lg" />
          </button>
        )}

        <div className="hidden min-w-0 items-center gap-2 sm:flex">
          {isAdminShell ? (
            <>
              <span className="text-sm font-medium text-[#64748b] dark:text-[#a1a1aa]">{isAdminManagerShell ? "Admin Manager" : "Admin"}</span>
              <span className="text-sm font-medium text-[#e5e7eb] dark:text-[#27272a]">/</span>
              <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{title}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">{title}</span>
          )}
        </div>
      </div>

      {isAdminShell && (
        <div className="hidden md:flex flex-1 justify-center relative">
          <div className="relative w-full max-w-md">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#a1a1aa] h-4 w-4" />
            <input
              type="text"
              placeholder="Search everywhere..."
              className="h-10 w-full max-w-md rounded-lg border border-[#e5e7eb] bg-white pl-10 pr-4 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3 w-1/3">
        
        {/* Language Switcher */}
        {isAdminShell && (
          <div className="hidden lg:flex items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white p-1 dark:border-[#27272a] dark:bg-[#111113]" id="language-switcher">
            <button
              onClick={() => {
                localStorage.setItem('language', 'en');
                window.dispatchEvent(new Event('languagechange'));
              }}
              className={language === 'en'
                ? "rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#020617] dark:bg-[#27272a] dark:text-[#f8fafc]"
                : "rounded-md px-2.5 py-1 text-xs font-semibold text-[#64748b] hover:bg-slate-100 hover:text-[#020617] dark:text-[#a1a1aa] dark:hover:bg-white/5 dark:hover:text-[#f8fafc]"}
            >
              EN
            </button>
            <button
              onClick={() => {
                localStorage.setItem('language', 'km');
                window.dispatchEvent(new Event('languagechange'));
              }}
              className={language === 'km'
                ? "rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#020617] dark:bg-[#27272a] dark:text-[#f8fafc]"
                : "rounded-md px-2.5 py-1 text-xs font-semibold text-[#64748b] hover:bg-slate-100 hover:text-[#020617] dark:text-[#a1a1aa] dark:hover:bg-white/5 dark:hover:text-[#f8fafc]"}
            >
              ខ្មែរ
            </button>
          </div>
        )}

        {/* Theme Toggle Button */}
        {isAdminShell && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#64748b] dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <LuSun className="h-5 w-5" />
            ) : (
              <LuMoon className="h-5 w-5" />
            )}
          </button>
        )}
        
        {/* Settings Icon */}
        {isAdminShell && (
          <button
            type="button"
            onClick={() => navigate("/admin-manager/settings")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#64748b] dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Settings"
          >
            <FaGear className="h-[18px] w-[18px]" />
          </button>
        )}

        {/* Notifications */}
        {isAdminManagerShell && (
          <div ref={notifMenuRef} className="relative">
            <button
              type="button"
              onClick={handleOpenNotifs}
              className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#64748b] dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Notifications"
            >
              <LuBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] dark:border-[#27272a] p-4">
                  <h3 className="font-bold text-[#020617] dark:text-[#f8fafc]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs font-semibold text-[#7033ff] hover:underline">
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {isLoadingNotifs ? (
                    <div className="p-8 text-center text-sm text-[#64748b] dark:text-[#a1a1aa]">Loading notifications...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#64748b] dark:text-[#a1a1aa]">No new notifications</div>
                  ) : (
                    notifications.map((n) => {
                      let sevClass = "bg-violet-50 text-violet-700";
                      if (n.severity === 'CRITICAL') sevClass = "bg-red-50 text-red-700";
                      if (n.severity === 'WARNING') sevClass = "bg-orange-50 text-orange-700";
                      if (n.severity === 'SUCCESS') sevClass = "bg-emerald-50 text-emerald-700";
                      
                      return (
                      <div 
                        key={n._id} 
                        className={`border-b border-[#e5e7eb] dark:border-[#27272a] p-4 transition-colors ${!n.read ? "bg-[#f8fafc] dark:bg-white/5" : "bg-white dark:bg-[#111113]"} hover:bg-slate-50 dark:hover:bg-[#09090b] cursor-pointer`}
                        onClick={() => !n.read && handleMarkRead(n._id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-sm font-semibold ${!n.read ? "text-[#020617] dark:text-[#f8fafc]" : "text-[#64748b] dark:text-[#a1a1aa]"}`}>{n.title}</span>
                          <span className="shrink-0 text-[10px] text-[#94a3b8] dark:text-[#71717a]">{dayjs(n.createdAt).fromNow(true)} ago</span>
                        </div>
                        <p className={`mt-1 text-xs mb-2 ${!n.read ? "text-[#334155] dark:text-[#d4d4d8]" : "text-[#64748b] dark:text-[#a1a1aa]"}`}>{n.message}</p>
                        {n.severity && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] ${sevClass}`}>
                            {n.severity}
                          </span>
                        )}
                      </div>
                    )})
                  )}
                </div>
                <div className="border-t border-[#e5e7eb] dark:border-[#27272a] p-2 text-center bg-slate-50 dark:bg-[#09090b]">
                  <button onClick={() => { setIsNotifOpen(false); navigate("/admin-manager/alerts"); }} className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa] hover:text-[#020617] dark:hover:text-[#f8fafc]">View all notifications</button>
                </div>
              </div>
            )}
          </div>
        )}

        {isCashier && !isAdminShell && (
          <button
            type="button"
            onClick={() => navigate("/cashier/pos")}
            className="btn btn-outline btn-sm hidden h-9 min-h-0 rounded-lg border-[#c6c6cd] px-3 text-xs text-[#0b1c30] hover:border-[#0058be] hover:bg-[#eff4ff] hover:text-[#0058be] sm:inline-flex"
          >
            <span>
              <GiTwoCoins />
            </span>
            <span>POS</span>
          </button>
        )}

        <div ref={accountMenuRef} className="relative ml-1">
          <button
            type="button"
            onClick={() => setIsAccountOpen((prev) => !prev)}
            className={isAdminShell
              ? "flex h-9 w-9 items-center justify-center rounded-xl bg-[#7033ff]/10 dark:bg-[#7033ff]/20 text-[#7033ff] hover:bg-[#7033ff]/20 transition-colors"
              : "btn btn-sm h-9 min-h-0 max-w-32 rounded-lg border-0 bg-violet-600 dark:bg-[#3350BF] px-2 text-xs text-white hover:bg-violet-700 dark:hover:bg-[#8B5CF6] sm:max-w-40 sm:px-3"
            }
          >
            {isAdminShell ? (
                <span className="text-sm font-bold">{username.charAt(0).toUpperCase()}</span>
            ) : (
                <span className="truncate capitalize">{username}</span>
            )}
          </button>
          
          {isAccountOpen && (
            <ul className={`absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border ${isAdminShell ? 'border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-sm' : 'border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] shadow-xl shadow-slate-200/50 dark:shadow-black/40'}`}>
              <li className={`border-b p-4 ${isAdminShell ? 'border-[#e5e7eb] dark:border-[#27272a]' : 'border-slate-100 dark:border-[#2A2E36]'}`}>
                <div className={`flex items-center gap-2 text-sm ${isAdminShell ? 'text-[#64748b] dark:text-[#a1a1aa]' : 'text-slate-500 dark:text-[#A9A6BB]'}`}>
                  <span className="shrink-0"><MdEmail /></span>
                  <span className="min-w-0 truncate">{email}</span>
                </div>
                <p className={`mt-1 truncate text-sm font-bold capitalize ${isAdminShell ? 'text-[#020617] dark:text-[#f8fafc]' : 'text-slate-900 dark:text-[#F8FAFC]'}`}>{username}</p>
              </li>
              <li>
                <button
                  onClick={handleSignOut}
                  type="button"
                  className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-red-600 dark:text-red-400 transition ${isAdminShell ? 'hover:bg-[#f8fafc] dark:hover:bg-[#09090b]' : 'dark:text-red-500 hover:bg-slate-50 dark:hover:bg-[#2A2E36]'}`}
                >
                  <span className="shrink-0"><TbLogout2 /></span>
                  <span>Log out</span>
                </button>
              </li>
            </ul>
          )}
        </div>

      </div>
    </header>
  );
}

export default TopMenu;
