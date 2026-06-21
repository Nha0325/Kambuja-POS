import AdminManagerStatCards from "../../features/admin-manager/components/AdminManagerStatCards";
import PageTitle from "../../shared/layout/PageTitle";
import { useI18nStore } from "../../app/i18nStore";

export default function AdminManagerDashboardPage() {
  const { t } = useI18nStore();
  return <><PageTitle title={t("dashboard.title", "Dashboard")} description={t("dashboard.subtitle", "Overview")} /><AdminManagerStatCards /></>;
}
