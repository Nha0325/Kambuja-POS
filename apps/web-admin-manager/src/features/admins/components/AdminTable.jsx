import { useEffect, useState } from "react";
import DataTable from "../../../shared/tables/DataTable";
import Loading from "../../../shared/ui/Loading";
import Badge from "../../../shared/ui/Badge";
import { listAdmins } from "../services/adminService";
import { useAdminStore } from "../store/adminStore";
import { useI18nStore } from "../../../app/i18nStore";

export default function AdminTable() {
  const admins = useAdminStore((state) => state.admins);
  const setAdmins = useAdminStore((state) => state.setAdmins);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useI18nStore();

  useEffect(() => {
    listAdmins().then(setAdmins).catch((requestError) => setError(requestError.response?.data?.message ?? requestError.message)).finally(() => setLoading(false));
  }, [setAdmins]);

  if (loading) return <Loading />;
  if (error) return <p className="text-rose-700">{error}</p>;
  return <DataTable rows={admins} columns={[
    { key: "name", label: t("admins.name", "Name") },
    { key: "email", label: t("admins.email", "Email") },
    { key: "province", label: t("shops.province", "Province") },
    { key: "city", label: t("shops.city", "City") },
    { key: "status", label: t("admins.status", "Status"), render: (row) => <Badge tone={row.status === "ACTIVE" ? "green" : "red"}>{row.status === "ACTIVE" ? t("common.active", "Active") : t("common.inactive", "Inactive")}</Badge> },
  ]} />;
}
