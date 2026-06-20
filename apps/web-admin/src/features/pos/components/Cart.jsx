import { useNavigate } from "react-router-dom";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import { formatMoney } from "../../../shared/utils/formatMoney";
import { createSale } from "../services/saleService";
import { useCart } from "../hooks/useCart";
import CartItem from "./CartItem";

export default function Cart() {
  const cart = useCart();
  const navigate = useNavigate();
  const checkout = async () => {
    const sale = await createSale({ discountAmount: 0, taxAmount: 0, notes: "", items: cart.items.map(({ productId, quantity, discount }) => ({ productId, quantity, discount })) });
    cart.setLastSale(sale);
    cart.clear();
    navigate("/pos/payment");
  };
  return <Card className="sticky top-5"><h2 className="text-lg font-bold">Cart</h2>{cart.items.map((item) => <CartItem key={item.productId} item={item} onQuantity={(quantity) => cart.updateQuantity(item.productId, quantity)} onRemove={() => cart.removeItem(item.productId)} />)}{!cart.items.length && <p className="py-6 text-center text-sm text-slate-500">Cart is empty.</p>}<div className="mt-4 flex justify-between font-bold"><span>Total</span><span>{formatMoney(cart.total)}</span></div><Button className="mt-4 w-full" disabled={!cart.items.length} onClick={checkout}>Complete sale</Button></Card>;
}
