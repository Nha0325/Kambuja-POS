import { useEffect } from "react";
import DataTable from "../../../shared/tables/DataTable";
import { listCashiers } from "../services/cashierService";
import { useCashierStore } from "../store/cashierStore";

export default function CashierTable() {
  const cashiers = useCashierStore((state) => state.cashiers);
  const setCashiers = useCashierStore((state) => state.setCashiers);
  useEffect(() => { listCashiers().then(setCashiers); }, [setCashiers]);
  return <DataTable rows={cashiers} columns={[{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "status", label: "Status" }]} />;
}
