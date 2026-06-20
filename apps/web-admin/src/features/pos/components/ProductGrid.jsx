import { useEffect, useState } from "react";
import Loading from "../../../shared/ui/Loading";
import { listProducts } from "../services/posService";
import ProductCard from "./ProductCard";

export default function ProductGrid({ search, onAdd }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); listProducts({ search, size: 100 }).then((result) => setProducts(result.content)).finally(() => setLoading(false)); }, [search]);
  if (loading) return <Loading />;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}</div>;
}
