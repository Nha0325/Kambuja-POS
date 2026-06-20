import { useCartStore } from "../store/cartStore";

export function useCart() {
  const state = useCartStore();
  const total = state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity - item.discount, 0);
  return { ...state, total };
}
