import { useEffect, useState } from "react";
import { listProducts } from "../services/productService";

export function useProducts(params = {}) {
  const [result, setResult] = useState({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    listProducts(params).then(setResult).catch((requestError) => setError(requestError.response?.data?.message ?? requestError.message)).finally(() => setLoading(false));
  }, [params.page, params.size, params.search]);
  return { result, loading, error };
}
