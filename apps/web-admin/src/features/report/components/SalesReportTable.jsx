import DataTable from "../../../shared/tables/DataTable";
import { formatMoney } from "../../../shared/utils/formatMoney";

export default function SalesReportTable({ report }) {
  const rows = report ? [report] : [];
  return <DataTable rows={rows} rowKey="shopId" columns={[{ key: "completedSales", label: "Completed sales" }, { key: "grossSales", label: "Gross", render: (row) => formatMoney(row.grossSales) }, { key: "discounts", label: "Discounts", render: (row) => formatMoney(row.discounts) }, { key: "taxes", label: "Taxes", render: (row) => formatMoney(row.taxes) }, { key: "netSales", label: "Net", render: (row) => formatMoney(row.netSales) }]} />;
}
