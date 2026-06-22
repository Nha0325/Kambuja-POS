import { FaListUl } from "react-icons/fa6";
import { GiTwoCoins } from "react-icons/gi";
import { FaUserCog } from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";
import { MdEmail } from "react-icons/md";
import useCurrent from "../hooks/auth/useCurrent";
import useSignout from "../hooks/auth/useSignout";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { ROLES, normalizeRole } from "../utils/role";
function TopMenu({ onShowSidebar }) {
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

  return (
    <div className="relative z-40 flex h-[60px] w-full min-w-0 items-center justify-between gap-3 border-b border-[#d7dced] bg-white px-3 shadow-sm sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
      {onShowSidebar && (
        <button
          onClick={onShowSidebar || undefined}
          type="button"
          className="shrink-0 rounded-lg p-2 text-xl text-[#0b1c30] hover:bg-[#eff4ff]"
          aria-label="Toggle sidebar"
        >
          <FaListUl />
        </button>
      )}
      {isCashier && <h1 className="min-w-0 truncate text-sm font-bold">Master POS</h1>}
      </div>

      <div className="flex min-w-0 items-center gap-2">
     
        {isCashier && (
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
            className="btn btn-sm h-9 min-h-0 max-w-32 rounded-lg border-0 bg-[#0b1c30] px-2 text-xs text-white hover:bg-[#213145] sm:max-w-40 sm:px-3"
          >
          <span>
            <FaUserCog />
          </span>
          <span className="truncate capitalize">{user?.username}</span>
        </button>
          {isAccountOpen && (
            <ul className="menu absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-[#d7dced] bg-white p-2 shadow-lg">
              <li className="border-b border-[#e5eeff]">
                <div className="flex items-center gap-2 p-2">
                  <span className="shrink-0"><MdEmail/></span>
                  <span className="min-w-0 truncate">{user?.email}</span>
                </div>
              </li>
              <li>
                <button onClick={handleSignOut} type="button" className="flex items-center gap-2 text-red-600">
                  <span className="shrink-0"><TbLogout2 /></span>
                  <span>Log out</span>
                </button>
              </li>
            </ul>
          )}
        </div>
       
      </div>
    </div>
  );
}

export default TopMenu;
