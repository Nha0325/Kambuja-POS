import { useEffect, useState } from "react";
import { listSales } from "../../features/pos/services/saleService";
import DataTable from "../../shared/tables/DataTable";
import PageTitle from "../../shared/layout/PageTitle";
import { formatMoney } from "../../shared/utils/formatMoney";
import { formatDate } from "../../shared/utils/formatDate";

export default function TodaySalesPage() {
  const [sales, setSales] = useState([]);
  useEffect(() => { const today = new Date().toISOString().slice(0, 10); listSales().then((rows) => setSales(rows.filter((sale) => sale.saleDate?.startsWith(today)))); }, []);
  return <><PageTitle title="Today sales" /><DataTable rows={sales} columns={[{ key: "saleNo", label: "Sale" }, { key: "saleDate", label: "Time", render: (row) => formatDate(row.saleDate) }, { key: "grandTotal", label: "Total", render: (row) => formatMoney(row.grandTotal) }, { key: "status", label: "Status" }]} /></>;
}
