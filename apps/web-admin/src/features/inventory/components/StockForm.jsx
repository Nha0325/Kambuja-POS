import { useState } from "react";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";
import { createStockMovement, saveInventory } from "../services/inventoryService";

export default function StockForm({ mode = "inventory", onSaved }) {
  const [form, setForm] = useState(mode === "inventory" ? { productId: "", quantity: 0, reorderLevel: 0 } : { productId: "", movementType: "STOCK_IN", quantity: 1, referenceType: "", referenceId: "", note: "" });
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.type === "number" ? Number(event.target.value) : event.target.value });
  return <form className="mb-5 grid gap-3 md:grid-cols-3" onSubmit={async (event) => { event.preventDefault(); const saved = mode === "inventory" ? await saveInventory(form) : await createStockMovement(form); onSaved?.(saved); }}><Input label="Product ID" required value={form.productId} onChange={update("productId")} />{mode === "movement" && <Select label="Movement type" value={form.movementType} onChange={update("movementType")}>{["STOCK_IN", "RETURN_IN", "RETURN_OUT", "ADJUSTMENT_IN", "ADJUSTMENT_OUT", "DAMAGE"].map((type) => <option key={type}>{type}</option>)}</Select>}<Input label="Quantity" type="number" min={mode === "inventory" ? 0 : 1} required value={form.quantity} onChange={update("quantity")} />{mode === "inventory" && <Input label="Reorder level" type="number" min="0" required value={form.reorderLevel} onChange={update("reorderLevel")} />}<Button type="submit" className="self-end">{mode === "inventory" ? "Save inventory" : "Record movement"}</Button></form>;
}
