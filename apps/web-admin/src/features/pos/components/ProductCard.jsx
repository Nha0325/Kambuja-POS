import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import { formatMoney } from "../../../shared/utils/formatMoney";

export default function ProductCard({ product, onAdd }) {
  return <Card><div className="mb-3 aspect-video rounded-lg bg-slate-100 bg-cover bg-center" style={product.image ? { backgroundImage: `url(${product.image})` } : undefined} /><h3 className="font-semibold">{product.name}</h3><p className="text-sm text-slate-500">{product.sku}</p><div className="mt-4 flex items-center justify-between"><span className="font-bold">{formatMoney(product.unitPrice)}</span><Button onClick={() => onAdd(product)}>Add</Button></div></Card>;
}
