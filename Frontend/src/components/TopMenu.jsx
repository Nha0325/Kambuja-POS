import { FaBars } from "react-icons/fa6";
import { GiTwoCoins } from "react-icons/gi";
import { FaUserCog } from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";
import { MdEmail } from "react-icons/md";
import useCurrent from "../hooks/auth/useCurrent";
import useSignout from "../hooks/auth/useSignout";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { ROLES, normalizeRole } from "../utils/role";
function TopMenu({ onShowSidebar, title, eyebrow }) {
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const accountMenuRef = useRef(null)
  const {data: user} = useCurrent()
  const {signout} = useSignout()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const res = await signout()
    if(res){
      navigate('/login')
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isCashier = normalizeRole(user?.role) === ROLES.CASHIER
  const normalizedRole = normalizeRole(user?.role)
  const username = user?.username || "User"
  const email = user?.email || "No email"
  const roleLabel = normalizedRole ? normalizedRole.replace(/_/g, " ").toLowerCase() : "account"
  const isAdminShell = Boolean(title)
  const eyebrowLabel = eyebrow || ""

  return (
    <header className={isAdminShell
      ? "sticky top-0 z-40 flex h-16 w-full min-w-0 items-center justify-between gap-3 border-b border-[#d7dced] bg-white/95 px-3 shadow-sm backdrop-blur sm:px-5"
      : "relative z-40 flex h-[60px] w-full min-w-0 items-center justify-between gap-3 border-b border-[#d7dced] bg-white px-3 shadow-sm sm:px-5"
    }>
      <div className="flex min-w-0 items-center gap-3">
        {onShowSidebar && (
          <button
            onClick={onShowSidebar || undefined}
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
            aria-label="Toggle sidebar"
          >
            <FaBars className="text-lg" />
          </button>
        )}
        {isAdminShell && (
          <div className="min-w-0">
            {eyebrowLabel && (
              <p className="text-[11px] font-bold uppercase text-[#0058be]">{eyebrowLabel}</p>
            )}
            <h1 className="truncate text-base font-bold leading-5 text-[#0b1c30] sm:text-xl">{title}</h1>
          </div>
        )}
        {!isAdminShell && isCashier && <h1 className="min-w-0 truncate text-sm font-bold">Master POS</h1>}
      </div>

      <div className="flex min-w-0 items-center gap-2">
     
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

        <div ref={accountMenuRef} className="relative">

          <button
            type="button"
            onClick={() => setIsAccountOpen((prev) => !prev)}
            className={isAdminShell
              ? "flex min-h-10 max-w-40 items-center gap-2 rounded-lg border border-[#d7dced] bg-white px-2 text-sm font-semibold text-[#0b1c30] transition hover:border-[#0058be] hover:bg-[#eff4ff] sm:max-w-56 sm:px-3"
              : "btn btn-sm h-9 min-h-0 max-w-32 rounded-lg border-0 bg-[#0b1c30] px-2 text-xs text-white hover:bg-[#213145] sm:max-w-40 sm:px-3"
            }
          >
          <span className={isAdminShell
            ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0b1c30] text-xs text-white"
            : ""
          }>
            <FaUserCog />
          </span>
          {isAdminShell ? (
            <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
              <span className="max-w-28 truncate capitalize">{username}</span>
              <span className="text-[10px] font-bold uppercase text-[#5b6472]">{roleLabel}</span>
            </span>
          ) : (
            <span className="truncate capitalize">{username}</span>
          )}
        </button>
          {isAccountOpen && (
            <ul className={isAdminShell
              ? "absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-[#d7dced] bg-white shadow-xl shadow-slate-200/70"
              : "menu absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-[#d7dced] bg-white p-2 shadow-lg"
            }>
              <li className={isAdminShell ? "border-b border-[#e5eeff] p-3" : "border-b border-[#e5eeff]"}>
                <div className={isAdminShell ? "flex items-center gap-2 text-sm text-[#45464d]" : "flex items-center gap-2 p-2"}>
                  <span className="shrink-0"><MdEmail/></span>
                  <span className="min-w-0 truncate">{email}</span>
                </div>
                {isAdminShell && <p className="mt-2 truncate text-sm font-semibold capitalize text-[#0b1c30]">{username}</p>}
              </li>
              <li>
                <button
                  onClick={handleSignOut}
                  type="button"
                  className={isAdminShell
                    ? "flex w-full items-center gap-2 px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    : "flex items-center gap-2 text-red-600"
                  }
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
