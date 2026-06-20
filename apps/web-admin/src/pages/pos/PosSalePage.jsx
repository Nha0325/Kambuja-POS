import { useState } from "react";
import BarcodeScanner from "../../features/pos/components/BarcodeScanner";
import Cart from "../../features/pos/components/Cart";
import ProductGrid from "../../features/pos/components/ProductGrid";
import ProductSearch from "../../features/pos/components/ProductSearch";
import { useCartStore } from "../../features/pos/store/cartStore";
import PageTitle from "../../shared/layout/PageTitle";

export default function PosSalePage() {
  const [search, setSearch] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  return <><PageTitle title="POS sale" /><div className="mb-5 grid gap-4 md:grid-cols-2"><ProductSearch value={search} onChange={setSearch} /><BarcodeScanner /></div><div className="grid gap-5 xl:grid-cols-[1fr_360px]"><ProductGrid search={search} onAdd={addItem} /><Cart /></div></>;
}
