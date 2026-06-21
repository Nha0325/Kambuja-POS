import { NavLink } from "react-router-dom";
import { useI18nStore } from "../../app/i18nStore";

export default function Sidebar() {
  const { t } = useI18nStore();

  const links = [
    ["/dashboard", t("nav.dashboard")],
    ["/admins", t("nav.admins")],
    ["/admins/create", t("nav.create-admin")],
    ["/shops", t("nav.shops")],
    ["/location/provinces", t("nav.locations")],
    ["/reports/sales", t("nav.sales-report")],
    ["/reports/stock", t("nav.stock-report")],
    ["/notifications", t("nav.notifications")],
    ["/settings", t("nav.settings")],
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 p-5 text-white">
      <p className="mb-8 text-lg font-bold">Kambuja POS</p>
      <nav className="grid gap-1">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-indigo-600" : "text-slate-300 hover:bg-slate-800"}`}>{label}</NavLink>
        ))}
      </nav>
    </aside>
  );
}
