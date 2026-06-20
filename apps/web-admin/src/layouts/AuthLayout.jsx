import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return <main className="grid min-h-screen place-items-center bg-slate-950 p-5"><section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"><Outlet /></section></main>;
}
