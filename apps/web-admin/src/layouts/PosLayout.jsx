import { Outlet } from "react-router-dom";
import Header from "../shared/layout/Header";
import Sidebar from "../shared/layout/Sidebar";

export default function PosLayout() {
  return <div className="flex min-h-screen"><Sidebar /><div className="min-w-0 flex-1"><Header title="Point of sale" /><main className="p-6"><Outlet /></main></div></div>;
}
