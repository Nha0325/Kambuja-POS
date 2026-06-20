import { useEffect } from "react";
import DataTable from "../../../shared/tables/DataTable";
import { listCustomers } from "../services/customerService";
import { useCustomerStore } from "../store/customerStore";

export default function CustomerTable() {
  const customers = useCustomerStore((state) => state.customers);
  const setCustomers = useCustomerStore((state) => state.setCustomers);
  useEffect(() => { listCustomers().then(setCustomers); }, [setCustomers]);
  return <DataTable rows={customers} columns={[{ key: "name", label: "Name" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "province", label: "Province" }, { key: "city", label: "City" }]} />;
}
