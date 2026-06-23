import { NavLink, useLocation, useNavigate } from "react-router";
import { AiFillHome } from "react-icons/ai";
import { TbActivityHeartbeat } from "react-icons/tb";
import { GoChevronDown } from "react-icons/go";
import { FaCashRegister } from "react-icons/fa6";
import { FaHandshake } from "react-icons/fa6";
import { FaUserFriends } from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { PiPackageFill } from "react-icons/pi";
import { IoBagHandle } from "react-icons/io5";
import { FaUserGear } from "react-icons/fa6";
import { IoStatsChart } from "react-icons/io5";

import { useState } from "react";
// eslint-disable-next-line react/prop-types
function Sidebar({ isShowSidebar }) {
  const [toggleSale, setToggleSale] = useState(false);
  const [toggleReport, setToggleReport] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isSaleRoute = pathname.startsWith("/sale");
  const isReportRoute = pathname.startsWith("/report");
  const navClass = ({ isActive }) =>
    `${
      isActive ? "bg-black text-white" : "text-black hover:bg-gray-100"
    } flex items-center gap-2 transition-all duration-300 w-full px-3 py-2 rounded-md text-sm`;

  return (
    <div
      className={`${
        isShowSidebar ? "w-[233px]" : "w-0"
      } min-h-screen overflow-hidden transition-all duration-300 bg-white fixed border-r border-gray-900 top-0 left-0 z-50`}
    >
      <div className="font-inter h-[72px] flex text-nowrap items-center justify-center text-xl font-bold">
        Master POS
      </div>

      <ul className="px-2.5 py-6 space-y-3">
        <li>
          <NavLink
            to="/"
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
            to="/customer"
            className={navClass}
          >
            <span className ="text-lg">
              <FaUserFriends />
            </span>
            <span>Customer</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/supplier"
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
            to="/category"
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
            to="/product"
            className={navClass}
          >
            <span className="text-lg">
              <PiPackageFill />
            </span>
            
            <span>Product</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/purchase"
            className={navClass}
          >
            <span className="text-lg">
              <IoBagHandle />
            </span>
            <span>Purchase</span>
          </NavLink>
        </li>

        <li>
          <button
            onClick={() => {
              setToggleSale(true);
              navigate("/sale/list");
            }}
            className={` ${
              isSaleRoute ?
              "bg-black text-white" : 'text-black hover:bg-gray-100'
            } flex justify-between items-center gap-2 transition-all duration-300 w-full px-3 py-2 rounded-md text-sm`}
          >
            <div className="flex items-center gap-2">
              <span>
                <FaCashRegister />
              </span>
              <span>Sale</span>
            </div>
            <span
              className={`${
                (toggleSale || isSaleRoute) && "rotate-180"
              } transition duration-300`}
            >
              <GoChevronDown />
            </span>
          </button>

          <ul
            className={`${
              toggleSale || isSaleRoute ? "block" : "hidden"
            } p-2 bg-base-200 transition-all duration-300 mt-1  rounded-md`}
          >
            <li>
              <NavLink
                to="/sale/pos"
                className="flex items-center gap-2 aria-[current=page]:font-semibold transition-all duration-300 w-full p-2"
              >
                <span className="text-base">
                  <TbActivityHeartbeat />
                </span>
                <span>POS</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/sale/list"
                className="flex items-center gap-2 aria-[current=page]:font-semibold transition-all duration-300 w-full p-2"
              >
                <span className="text-lg">
                  <TbActivityHeartbeat />
                </span>
                <span>List Sale</span>
              </NavLink>
            </li>
          </ul>
        </li>
        <li>
          <NavLink
            to="/user" // Ensure this path is correct for your user list
            className={navClass}
          >
            <span className="text-lg">
              <FaUserGear />
            </span>
            <span>User</span>
          </NavLink>
        </li>
        <li>
          <button
            onClick={() => {
              setToggleReport(true);
              navigate("/report/sale");
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
                to="/report/sale"
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
                to="/report/stock"
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
