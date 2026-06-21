import NotificationList from "../../features/notifications/components/NotificationList";
import PageTitle from "../../shared/layout/PageTitle";
import { useI18nStore } from "../../app/i18nStore";

export default function NotificationsPage() {
  const { t } = useI18nStore();
  return (
    <>
      <PageTitle title={t("notifications.title", "Notifications")} />
      <NotificationList />
    </>
  );
}
