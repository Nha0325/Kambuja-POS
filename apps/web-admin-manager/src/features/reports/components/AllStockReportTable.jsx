import DataTable from "../../../shared/tables/DataTable";

export default function AllStockReportTable({ rows }) {
  return <DataTable rows={rows} columns={[
    { key: "productName", label: "Product" },
    { key: "province", label: "Province" },
    { key: "city", label: "City" },
    { key: "quantity", label: "Quantity" },
    { key: "reorderLevel", label: "Reorder level" },
  ]} />;
}
