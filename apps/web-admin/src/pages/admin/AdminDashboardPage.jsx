import { useEffect, useState } from "react";
import RevenueChart from "../../features/report/components/RevenueChart";
import { getDashboard } from "../../features/report/services/reportService";
import PageTitle from "../../shared/layout/PageTitle";
import Card from "../../shared/ui/Card";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  useEffect(() => { getDashboard().then(setDashboard); }, []);
  return <><PageTitle title="Admin dashboard" />{dashboard && <><div className="mb-5 grid gap-4 md:grid-cols-3">{[["Products", dashboard.totalProducts], ["Users", dashboard.totalUsers], ["Sales", dashboard.totalSalesCount]].map(([label, value]) => <Card key={label}><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-bold">{value}</p></Card>)}</div><RevenueChart total={dashboard.totalSales} today={dashboard.todaySales} /></>}</>;
}
