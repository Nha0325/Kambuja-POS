import { useEffect, useState } from "react";
import Button from "../../../shared/ui/Button";
import Loading from "../../../shared/ui/Loading";
import { formatDate } from "../../../shared/utils/formatDate";
import { listNotifications, markNotificationRead } from "../services/notificationService";
import { useNotificationStore } from "../store/notificationStore";

export default function NotificationList() {
  const notifications = useNotificationStore((state) => state.notifications);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const [loading, setLoading] = useState(true);
  useEffect(() => { listNotifications().then(setNotifications).finally(() => setLoading(false)); }, [setNotifications]);
  if (loading) return <Loading />;
  return <div className="grid gap-3">{notifications.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex justify-between gap-4"><div><h2 className="font-semibold">{item.title}</h2><p className="text-sm text-slate-600">{item.message}</p><p className="mt-2 text-xs text-slate-400">{item.province ?? "Platform"} · {formatDate(item.createdAt)}</p></div>{!item.read && <Button onClick={async () => { const updated = await markNotificationRead(item.id); setNotifications(notifications.map((current) => current.id === updated.id ? updated : current)); }}>Mark read</Button>}</div></article>)}</div>;
}
