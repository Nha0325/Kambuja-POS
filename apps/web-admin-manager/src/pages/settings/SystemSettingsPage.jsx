import SystemSettingsForm from "../../features/settings/components/SystemSettingsForm";
import PageTitle from "../../shared/layout/PageTitle";
import { useI18nStore } from "../../app/i18nStore";

export default function SystemSettingsPage() {
  const { t } = useI18nStore();
  return (
    <>
      <PageTitle title={t("settings.title", "System settings")} />
      <SystemSettingsForm />
    </>
  );
}
