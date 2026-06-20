import { useEffect, useState } from "react";
import DataTable from "../../../shared/tables/DataTable";
import Loading from "../../../shared/ui/Loading";
import Badge from "../../../shared/ui/Badge";
import { listAdmins } from "../services/adminService";
import { useAdminStore } from "../store/adminStore";

export default function AdminTable() {
  const admins = useAdminStore((state) => state.admins);
  const setAdmins = useAdminStore((state) => state.setAdmins);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listAdmins().then(setAdmins).catch((requestError) => setError(requestError.response?.data?.message ?? requestError.message)).finally(() => setLoading(false));
  }, [setAdmins]);

  if (loading) return <Loading />;
  if (error) return <p className="text-rose-700">{error}</p>;
  return <DataTable rows={admins} columns={[
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "province", label: "Province" },
    { key: "city", label: "City" },
    { key: "status", label: "Status", render: (row) => <Badge tone={row.status === "ACTIVE" ? "green" : "red"}>{row.status}</Badge> },
  ]} />;
}
