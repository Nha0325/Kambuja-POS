import { useEffect, useState } from "react";
import Card from "../../../shared/ui/Card";
import Loading from "../../../shared/ui/Loading";
import { formatMoney } from "../../../shared/utils/formatMoney";
import { getDashboard } from "../services/adminManagerService";
import { useAdminManagerStore } from "../store/adminManagerStore";

export default function AdminManagerStatCards() {
  const dashboard = useAdminManagerStore((state) => state.dashboard);
  const setDashboard = useAdminManagerStore((state) => state.setDashboard);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard().then(setDashboard).catch((requestError) => setError(requestError.response?.data?.message ?? requestError.message));
  }, [setDashboard]);

  if (error) return <p className="text-rose-700">{error}</p>;
  if (!dashboard) return <Loading />;

  const stats = [
    ["Shops", dashboard.totalShops],
    ["Admins", dashboard.totalAdmins],
    ["Cashiers", dashboard.totalCashiers],
    ["Products", dashboard.totalProducts],
    ["Sales", dashboard.totalSalesCount],
    ["Revenue", formatMoney(dashboard.totalSales)],
  ];
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{stats.map(([label, value]) => <Card key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></Card>)}</div>;
}
