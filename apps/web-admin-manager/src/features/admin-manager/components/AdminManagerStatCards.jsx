import { useEffect, useState } from "react";
import Card from "../../../shared/ui/Card";
import Loading from "../../../shared/ui/Loading";
import { formatMoney } from "../../../shared/utils/formatMoney";
import { getDashboard } from "../services/adminManagerService";
import { useAdminManagerStore } from "../store/adminManagerStore";
import { useI18nStore } from "../../../app/i18nStore";

export default function AdminManagerStatCards() {
  const dashboard = useAdminManagerStore((state) => state.dashboard);
  const setDashboard = useAdminManagerStore((state) => state.setDashboard);
  const [error, setError] = useState("");
  const { t } = useI18nStore();

  useEffect(() => {
    getDashboard().then(setDashboard).catch((requestError) => setError(requestError.response?.data?.message ?? requestError.message));
  }, [setDashboard]);

  if (error) return <p className="text-rose-700">{error}</p>;
  if (!dashboard) return <Loading />;

  const stats = [
    [t("dashboard.stat.shops", "Shops"), dashboard.totalShops],
    [t("dashboard.stat.admins", "Admins"), dashboard.totalAdmins],
    [t("dashboard.stat.cashiers", "Cashiers"), dashboard.totalCashiers],
    [t("dashboard.stat.products", "Products"), dashboard.totalProducts],
    [t("dashboard.stat.sales", "Sales"), dashboard.totalSalesCount],
    [t("dashboard.stat.revenue", "Revenue"), formatMoney(dashboard.totalSales)],
  ];
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{stats.map(([label, value]) => <Card key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></Card>)}</div>;
}
