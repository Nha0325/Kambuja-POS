import Input from "../../../shared/ui/Input";
import { formatMoney } from "../../../shared/utils/formatMoney";

export default function CartItem({ item, onQuantity, onRemove }) {
  return <div className="grid grid-cols-[1fr_90px_auto] items-end gap-2 border-b border-slate-100 py-3"><div><p className="font-medium">{item.name}</p><p className="text-xs text-slate-500">{formatMoney(item.unitPrice)}</p></div><Input label="Qty" type="number" min="1" value={item.quantity} onChange={(event) => onQuantity(Number(event.target.value))} /><button className="pb-2 text-sm text-rose-600" onClick={onRemove}>Remove</button></div>;
}
