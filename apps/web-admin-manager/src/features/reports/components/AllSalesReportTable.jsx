import DataTable from "../../../shared/tables/DataTable";
import { formatMoney } from "../../../shared/utils/formatMoney";

export default function AllSalesReportTable({ rows }) {
  return <DataTable rows={rows} rowKey="shopId" columns={[
    { key: "shopName", label: "Shop" },
    { key: "province", label: "Province" },
    { key: "city", label: "City" },
    { key: "completedSales", label: "Sales" },
    { key: "netSales", label: "Revenue", render: (row) => formatMoney(row.netSales) },
  ]} />;
}
