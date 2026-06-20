import DataTable from "../../../shared/tables/DataTable";
export default function StockReportTable({ rows }) {
  return <DataTable rows={rows} columns={[{ key: "productName", label: "Product" }, { key: "quantity", label: "Quantity" }, { key: "reorderLevel", label: "Reorder level" }]} />;
}
