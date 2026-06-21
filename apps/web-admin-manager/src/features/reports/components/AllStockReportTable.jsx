import DataTable from "../../../shared/tables/DataTable";
import { useI18nStore } from "../../../app/i18nStore";

export default function AllStockReportTable({ rows }) {
  const { t } = useI18nStore();
  return <DataTable rows={rows} columns={[
    { key: "productName", label: t("reports.stock.product", "Product") },
    { key: "province", label: t("shops.province", "Province") },
    { key: "city", label: t("shops.city", "City") },
    { key: "quantity", label: t("reports.stock.quantity", "Quantity") },
    { key: "reorderLevel", label: t("reports.stock.lowStock", "Reorder level") },
  ]} />;
}
