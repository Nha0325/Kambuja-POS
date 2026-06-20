import { useState } from "react";
import DataTable from "../../../shared/tables/DataTable";
import Pagination from "../../../shared/tables/Pagination";
import Input from "../../../shared/ui/Input";
import Loading from "../../../shared/ui/Loading";
import { formatMoney } from "../../../shared/utils/formatMoney";
import { useDebounce } from "../../../shared/hooks/useDebounce";
import { useProducts } from "../hooks/useProducts";

export default function ProductTable() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);
  const { result, loading, error } = useProducts({ page, size: 20, search: debounced });
  return <div className="grid gap-4"><Input label="Search products" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} />{loading ? <Loading /> : error ? <p className="text-rose-700">{error}</p> : <><DataTable rows={result.content} columns={[{ key: "name", label: "Product" }, { key: "sku", label: "SKU" }, { key: "unitPrice", label: "Price", render: (row) => formatMoney(row.unitPrice) }, { key: "status", label: "Status" }]} /><Pagination page={page} totalPages={result.totalPages} onPageChange={setPage} /></>}</div>;
}
