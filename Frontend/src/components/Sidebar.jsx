import { NavLink, useLocation } from "react-router";
import { AiFillHome } from "react-icons/ai";
import { TbActivityHeartbeat } from "react-icons/tb";
import { GoChevronDown } from "react-icons/go";
import { FaHandshake, FaUsers } from "react-icons/fa6";
import { MdCategory, MdInventory2, MdNotifications, MdSettings } from "react-icons/md";
import { PiPackageFill } from "react-icons/pi";
import { IoBagHandle } from "react-icons/io5";
import { FaUserGear } from "react-icons/fa6";
import { IoStatsChart } from "react-icons/io5";

import { useState } from "react";
function Sidebar({ isShowSidebar, onNavigate }) {
  const [toggleReport, setToggleReport] = useState(false);
  const { pathname } = useLocation();
  const isReportRoute = pathname.startsWith("/admin/reports") || pathname.startsWith("/report");
  
  const navClass = ({ isActive }) =>
    `${
      isActive
        ? "scale-[0.99] bg-violet-600 text-white shadow-sm shadow-violet-200"
        : "text-slate-600 hover:bg-violet-50 hover:text-violet-800"
    } flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all w-full`;

  const reportBtnClass = `${
    isReportRoute
      ? "scale-[0.99] bg-violet-600 text-white shadow-sm shadow-violet-200"
      : "text-slate-600 hover:bg-violet-50 hover:text-violet-800"
  } flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all`;

  return (
    <aside
      className={`${
        isShowSidebar ? "translate-x-0" : "-translate-x-full"
      } fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col overflow-x-hidden overflow-y-auto border-r border-violet-100 bg-white p-6 shadow-sm transition-transform duration-300`}
    >
      <div className="mb-10 whitespace-nowrap">
        <h1 className="text-3xl font-bold leading-tight text-slate-900">Kambuja</h1>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-violet-700">Shop Management</p>
      </div>

      <nav className="flex-1 space-y-2">
        <NavLink to="/admin/dashboard" className={navClass} onClick={onNavigate}>
          <span className="text-lg"><AiFillHome /></span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/suppliers" className={navClass} onClick={onNavigate}>
          <span className="text-lg"><FaHandshake /></span>
          <span>Suppliers</span>
        </NavLink>

        <NavLink to="/admin/categories" className={navClass} onClick={onNavigate}>
          <span className="text-lg"><MdCategory /></span>
          <span>Categories</span>
        </NavLink>

        <NavLink to="/admin/customers" className={navClass} onClick={onNavigate}>
          <span className="text-lg"><FaUsers /></span>
          <span>Customers</span>
        </NavLink>

        <NavLink to="/admin/products" className={navClass} onClick={onNavigate}>
          <span className="text-lg"><PiPackageFill /></span>
          <span>Products</span>
        </NavLink>

        <NavLink to="/admin/inventory" className={navClass} onClick={onNavigate}>
          <span className="text-lg"><MdInventory2 /></span>
          <span>Inventory</span>
        </NavLink>

        <NavLink to="/admin/purchases" className={navClass} onClick={onNavigate}>
          <span className="text-lg"><IoBagHandle /></span>
          <span>Purchases</span>
        </NavLink>

        <NavLink to="/admin/cashiers" className={navClass} onClick={onNavigate}>
          <span className="text-lg"><FaUserGear /></span>
          <span>Cashiers</span>
        </NavLink>

        <NavLink to="/admin/notifications/channels" className={navClass} onClick={onNavigate}>
          <span className="text-lg"><MdNotifications /></span>
          <span>Notifications</span>
        </NavLink>
        
        <div>
          <button
            onClick={() => {
              setToggleReport(!toggleReport);
            }}
            className={reportBtnClass}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg"><IoStatsChart /></span>
              <span>Reports</span>
            </div>
            <span className={`${(toggleReport || isReportRoute) && "rotate-180"} transition duration-300`}>
              <GoChevronDown />
            </span>
          </button>

          <ul
            className={`${
              toggleReport || isReportRoute ? "block" : "hidden"
            } mt-2 space-y-1 overflow-hidden`}
          >
            <li>
              <NavLink
                to="/admin/reports/sales"
                className={({ isActive }) =>
                  `${
                    isActive ? "font-bold text-violet-700" : "text-slate-600 hover:text-violet-800 hover:bg-violet-50"
                  } flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-300 pl-11`
                }
                onClick={onNavigate}
              >
                <span className="text-base"><TbActivityHeartbeat /></span>
                <span>Sale Report</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/reports/stock"
                className={({ isActive }) =>
                  `${
                    isActive ? "font-bold text-violet-700" : "text-slate-600 hover:text-violet-800 hover:bg-violet-50"
                  } flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-300 pl-11`
                }
                onClick={onNavigate}
              >
                <span className="text-lg"><TbActivityHeartbeat /></span>
                <span>Stock Report</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      
      <nav className="mt-auto border-t border-violet-100 pt-6">
        <NavLink to="/admin/shop-settings" className={navClass} onClick={onNavigate}>
          <span className="text-lg"><MdSettings /></span>
          <span>Shop Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
