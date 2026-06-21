import DataTable from "../../../shared/tables/DataTable";
import { formatMoney } from "../../../shared/utils/formatMoney";
import { useI18nStore } from "../../../app/i18nStore";

export default function AllSalesReportTable({ rows }) {
  const { t } = useI18nStore();
  return <DataTable rows={rows} rowKey="shopId" columns={[
    { key: "shopName", label: t("shops.name", "Shop") },
    { key: "province", label: t("shops.province", "Province") },
    { key: "city", label: t("shops.city", "City") },
    { key: "completedSales", label: t("reports.sales.total", "Sales") },
    { key: "netSales", label: t("dashboard.stat.revenue", "Revenue"), render: (row) => formatMoney(row.netSales) },
  ]} />;
}
