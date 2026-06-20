import { useEffect, useState } from "react";
import DataTable from "../../../shared/tables/DataTable";
import Loading from "../../../shared/ui/Loading";
import { listShops } from "../services/shopService";
import { useShopStore } from "../store/shopStore";

export default function ShopTable() {
  const shops = useShopStore((state) => state.shops);
  const setShops = useShopStore((state) => state.setShops);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    listShops().then(setShops).catch((requestError) => setError(requestError.response?.data?.message ?? requestError.message)).finally(() => setLoading(false));
  }, [setShops]);
  if (loading) return <Loading />;
  if (error) return <p className="text-rose-700">{error}</p>;
  return <DataTable rows={shops} columns={[
    { key: "code", label: "Code" },
    { key: "name", label: "Shop" },
    { key: "province", label: "Province" },
    { key: "city", label: "City" },
    { key: "status", label: "Status" },
  ]} />;
}
