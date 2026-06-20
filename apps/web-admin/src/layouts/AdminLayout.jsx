import { Outlet } from "react-router-dom";
import Header from "../shared/layout/Header";
import Sidebar from "../shared/layout/Sidebar";

export default function AdminLayout() {
  return <div className="flex min-h-screen"><Sidebar /><div className="min-w-0 flex-1"><Header title="Shop administration" /><main className="p-6"><Outlet /></main></div></div>;
}
