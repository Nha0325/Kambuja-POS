import { NavLink, useLocation, useNavigate } from "react-router";
import { AiFillHome } from "react-icons/ai";
import { TbActivityHeartbeat } from "react-icons/tb";
import { GoChevronDown } from "react-icons/go";
import { FaHandshake } from "react-icons/fa6";
import { MdCategory, MdInventory2, MdNotifications, MdSettings } from "react-icons/md";
import { PiPackageFill } from "react-icons/pi";
import { IoBagHandle } from "react-icons/io5";
import { FaUserGear } from "react-icons/fa6";
import { IoStatsChart } from "react-icons/io5";

import { useState } from "react";
function Sidebar({ isShowSidebar }) {
  const [toggleReport, setToggleReport] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isReportRoute = pathname.startsWith("/admin/reports") || pathname.startsWith("/report");
  const navClass = ({ isActive }) =>
    `${
      isActive ? "bg-black text-white" : "text-black hover:bg-gray-100"
    } flex items-center gap-2 transition-all duration-300 w-full px-3 py-2 rounded-md text-sm`;

  return (
    <div
      className={`${
        isShowSidebar ? "w-[233px]" : "w-0"
      } fixed left-0 top-0 z-50 h-screen overflow-x-hidden overflow-y-auto border-r border-gray-900 bg-white transition-all duration-300`}
    >
      <div className="font-inter h-[72px] flex text-nowrap items-center justify-center text-xl font-bold">
        Master POS
      </div>

      <ul className="px-2.5 py-6 space-y-3">
        <li>
          <NavLink
            to="/admin/dashboard"
            className={navClass}
          >
            <span className="text-lg">
              <AiFillHome />
            </span>
            <span>Home</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/suppliers"
            className={navClass}
          >
            <span className="text-lg">
              <FaHandshake />
            </span>
            <span>Supplier</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/categories"
            className={navClass}
          >
            <span className="text-lg">
              <MdCategory />
            </span>
            <span>Category</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/products"
            className={navClass}
          >
            <span className="text-lg">
              <PiPackageFill />
            </span>
            
            <span>Product</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/inventory" className={navClass}>
            <span className="text-lg"><MdInventory2 /></span>
            <span>Inventory</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/purchases"
            className={navClass}
          >
            <span className="text-lg">
              <IoBagHandle />
            </span>
            <span>Purchase</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/cashiers"
            className={navClass}
          >
            <span className="text-lg">
              <FaUserGear />
            </span>
            <span>Cashiers</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/notifications/channels" className={navClass}>
            <span className="text-lg"><MdNotifications /></span>
            <span>Notifications</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/shop-settings" className={navClass}>
            <span className="text-lg"><MdSettings /></span>
            <span>Shop Settings</span>
          </NavLink>
        </li>
        <li>
          <button
            onClick={() => {
              setToggleReport(true);
              navigate("/admin/reports/sales");
            }}
            className={`${
              isReportRoute ? "bg-black text-white" : "text-black hover:bg-gray-100"
            } flex justify-between items-center gap-2 transition-all duration-300 w-full px-3 py-2 rounded-md text-sm`}
          >
            <div className="flex items-center gap-2">
              <span>
                <IoStatsChart />
              </span>
              <span>Report</span>
            </div>
            <span
              className={`${
                (toggleReport || isReportRoute) && "rotate-180"
              } transition duration-300`}
            >
              <GoChevronDown />
            </span>
          </button>

          <ul
            className={`${
              toggleReport || isReportRoute ? "block" : "hidden"
            } p-2 bg-base-200 transition-all duration-300 mt-1  rounded-md`}
          >
            <li>
              <NavLink
                to="/admin/reports/sales"
                className="flex items-center gap-2 aria-[current=page]:font-semibold transition-all duration-300 w-full p-2"
              >
                <span className="text-base">
                  <TbActivityHeartbeat />
                </span>
                <span>Sale Report</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/reports/stock"
                className="flex items-center gap-2 aria-[current=page]:font-semibold transition-all duration-300 w-full p-2"
              >
                <span className="text-lg">
                  <TbActivityHeartbeat />
                </span>
                <span>Stock Report</span>
              </NavLink>
            </li>
          </ul>
        </li>

        
      </ul>
    </div>
  );
}

export default Sidebar;
