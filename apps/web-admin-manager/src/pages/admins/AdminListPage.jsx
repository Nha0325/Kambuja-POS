import AdminTable from "../../features/admins/components/AdminTable";
import PageTitle from "../../shared/layout/PageTitle";
import { useI18nStore } from "../../app/i18nStore";

export default function AdminListPage() {
  const { t } = useI18nStore();
  return <><PageTitle title={t("admins.title", "Administrators")} description={t("admins.subtitle", "Manage platform administrators")} /><AdminTable /></>;
}
