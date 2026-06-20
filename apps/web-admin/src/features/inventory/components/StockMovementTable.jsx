import { useEffect } from "react";
import DataTable from "../../../shared/tables/DataTable";
import StockForm from "./StockForm";
import { formatDate } from "../../../shared/utils/formatDate";
import { listStockMovements } from "../services/inventoryService";
import { useInventoryStore } from "../store/inventoryStore";

export default function StockMovementTable() {
  const movements = useInventoryStore((state) => state.movements);
  const setMovements = useInventoryStore((state) => state.setMovements);
  useEffect(() => { listStockMovements().then(setMovements); }, [setMovements]);
  return <><StockForm mode="movement" onSaved={(saved) => setMovements([saved, ...movements])} /><DataTable rows={movements} columns={[{ key: "productId", label: "Product ID" }, { key: "movementType", label: "Type" }, { key: "quantity", label: "Quantity" }, { key: "afterQuantity", label: "After" }, { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) }]} /></>;
}
