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

  return (
    <div className="relative z-40 h-[56px] border-b border-gray-400 bg-white flex items-center justify-between w-full px-4">
      {normalizeRole(user?.role) === ROLES.CASHIER && <h1 className="text-sm font-bold">Master POS</h1>}

      {normalizeRole(user?.role) !== ROLES.CASHIER && (
        <button
          onClick={onShowSidebar || undefined}
          type="button"
          className="text-xl text-gray-900"
          aria-label="Toggle sidebar"
        >
          <FaListUl />
        </button>
      )}

      <div className="flex min-w-0 items-center gap-2">
     
        {normalizeRole(user?.role) === ROLES.CASHIER && (
          <button
            type="button"
            onClick={() => navigate("/cashier/pos")}
            className="btn btn-outline btn-neutral btn-sm min-h-0 h-8 rounded-sm px-3 text-xs"
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
            className="btn btn-neutral btn-sm min-h-0 h-8 max-w-40 rounded-sm px-3 text-xs"
          >
          <span>
            <FaUserCog />
          </span>
          <span className="truncate capitalize">{user?.username}</span>
        </button>
          {isAccountOpen && (
            <ul className="menu absolute right-0 top-full z-50 mt-2 w-64 rounded-box border border-gray-200 bg-base-100 p-2 shadow-lg">
              <li className="border-b border-gray-200">
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
