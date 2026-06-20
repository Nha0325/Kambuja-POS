import AdminManagerStatCards from "../../features/admin-manager/components/AdminManagerStatCards";
import PageTitle from "../../shared/layout/PageTitle";

export default function AdminManagerDashboardPage() {
  return <><PageTitle title="Dashboard" description="Platform-wide shops, users, products, and sales." /><AdminManagerStatCards /></>;
}
