import { useEffect } from "react";
import DataTable from "../../../shared/tables/DataTable";
import Badge from "../../../shared/ui/Badge";
import StockForm from "./StockForm";
import { listInventory } from "../services/inventoryService";
import { useInventoryStore } from "../store/inventoryStore";

export default function StockTable() {
  const inventory = useInventoryStore((state) => state.inventory);
  const setInventory = useInventoryStore((state) => state.setInventory);
  useEffect(() => { listInventory().then(setInventory); }, [setInventory]);
  return <><StockForm onSaved={(saved) => setInventory([...inventory.filter((item) => item.id !== saved.id), saved])} /><DataTable rows={inventory} columns={[{ key: "productName", label: "Product" }, { key: "quantity", label: "Quantity" }, { key: "reorderLevel", label: "Reorder level" }, { key: "lowStock", label: "Stock", render: (row) => <Badge tone={row.lowStock ? "red" : "green"}>{row.lowStock ? "LOW" : "OK"}</Badge> }]} /></>;
}
