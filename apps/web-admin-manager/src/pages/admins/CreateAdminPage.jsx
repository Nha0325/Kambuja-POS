import CreateAdminForm from "../../features/admins/components/CreateAdminForm";
import PageTitle from "../../shared/layout/PageTitle";
import { useI18nStore } from "../../app/i18nStore";

export default function CreateAdminPage() {
  const { t } = useI18nStore();
  return <>
    <PageTitle title={t("admins.createTitle", "Create Admin")} description={t("admins.createSubtitle", "Assign the business owner to an existing shop.")} />
    <CreateAdminForm />
  </>;
}
