import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../utils/config/api";
import { LuSearch, LuEye } from "react-icons/lu";
import { FaBoxesStacked, FaStore, FaTriangleExclamation, FaCircleExclamation } from "react-icons/fa6";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeShops: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  });

  const [shops, setShops] = useState([]);
  
  // Filters
  const [search, setSearch] = useState("");
  const [shopId, setShopId] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStats = async () => {
    try {
      const [dashRes, shopsRes] = await Promise.all([
        api.get('/admin-manager/dashboard'),
        api.get('/admin-manager/shops')
      ]);
      const data = dashRes.data?.result || {};
      setStats({
        totalProducts: data.totalProducts || 0,
        activeShops: data.activeShops || 0,
        lowStockProducts: data.lowStockProducts || 0,
        outOfStockProducts: data.outOfStockProducts || 0,
      });
      setShops(shopsRes.data?.result || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin-manager/products', {
        params: {
          q: search,
          shopId: shopId || undefined,
          stockStatus: stockStatus || undefined,
          page,
          limit: 15
        }
      });
      setProducts(res.data?.result || []);
      setTotalPages(res.data?.totalPage || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, shopId, stockStatus, page]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchProducts]);


  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa] mb-2">
          <span>Admin Manager</span>
          <span>/</span>
          <span className="font-medium text-[#06b6d4]">Products Monitor</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#0f172a] dark:text-[#f8fafc] md:text-3xl">Global Products Monitor</h1>
        <p className="mt-1 text-sm text-[#64748b] dark:text-[#a1a1aa]">View products across all shops. Read-only access.</p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#06b6d4]/10 text-[#06b6d4]">
            <FaBoxesStacked className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#64748b] dark:text-[#a1a1aa]">Total Products</p>
            <p className="text-2xl font-bold text-[#0f172a] dark:text-[#f8fafc]">{stats.totalProducts}</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
            <FaStore className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#64748b] dark:text-[#a1a1aa]">Active Shops</p>
            <p className="text-2xl font-bold text-[#0f172a] dark:text-[#f8fafc]">{stats.activeShops}</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <FaTriangleExclamation className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#64748b] dark:text-[#a1a1aa]">Low Stock</p>
            <p className="text-2xl font-bold text-[#0f172a] dark:text-[#f8fafc]">{stats.lowStockProducts}</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <FaCircleExclamation className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#64748b] dark:text-[#a1a1aa]">Out of Stock</p>
            <p className="text-2xl font-bold text-[#0f172a] dark:text-[#f8fafc]">{stats.outOfStockProducts}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input 
            type="search" 
            placeholder="Search by name, barcode, SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] pl-10 pr-3 text-sm text-[#0f172a] dark:text-[#f8fafc] outline-none transition-colors focus:border-[#06b6d4]"
          />
        </div>
        <select
          value={shopId}
          onChange={(e) => setShopId(e.target.value)}
          className="h-10 rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-3 text-sm text-[#0f172a] dark:text-[#f8fafc] outline-none transition-colors focus:border-[#06b6d4]"
        >
          <option value="">All Shops</option>
          {shops.map(s => (
            <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
          ))}
        </select>
        <select
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value)}
          className="h-10 rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-3 text-sm text-[#0f172a] dark:text-[#f8fafc] outline-none transition-colors focus:border-[#06b6d4]"
        >
          <option value="">All Stock Status</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113]">
        <table className="min-w-full text-left">
          <thead className="border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] text-[11px] font-bold uppercase tracking-[0.08em] text-[#64748b] dark:text-[#a1a1aa]">
            <tr>
              <th className="whitespace-nowrap px-4 py-3">Product Name</th>
              <th className="whitespace-nowrap px-4 py-3">Barcode / SKU</th>
              <th className="whitespace-nowrap px-4 py-3">Shop</th>
              <th className="whitespace-nowrap px-4 py-3">Owner/Admin</th>
              <th className="whitespace-nowrap px-4 py-3">Category</th>
              <th className="whitespace-nowrap px-4 py-3">Supplier</th>
              <th className="whitespace-nowrap px-4 py-3">Stock</th>
              <th className="whitespace-nowrap px-4 py-3">Cost Price</th>
              <th className="whitespace-nowrap px-4 py-3">Sale Price</th>
              <th className="whitespace-nowrap px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="p-8 text-center text-sm text-[#64748b]">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={10} className="p-8 text-center text-sm text-[#64748b]">No products found</td></tr>
            ) : (
              products.map(p => (
                <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-[#18181b] transition-colors border-b border-[#e5e7eb] dark:border-[#27272a] last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-[#0f172a] dark:text-[#f8fafc] font-medium">{p.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-[#0f172a] dark:text-[#f8fafc]">
                    <div className="font-medium">{p.barcode || "-"}</div>
                    <div className="text-xs text-[#64748b]">{p.sku || "-"}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-[#0f172a] dark:text-[#f8fafc]">
                    <div className="font-medium">{p.shopId?.name || "Unknown"}</div>
                    <div className="text-xs text-[#64748b]">Code: {p.shopId?.code || "-"}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-[#0f172a] dark:text-[#f8fafc]">
                    {p.shopId?.ownerAdminId?.fullName || p.shopId?.ownerAdminId?.username || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-[#0f172a] dark:text-[#f8fafc]">{p.category?.name || "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-[#0f172a] dark:text-[#f8fafc]">{p.supplier?.name || "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {p.stock ?? p.currentStock ?? 0}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-[#64748b] dark:text-[#a1a1aa] font-medium">
                    ${(p.costPrice || 0).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
                    ${(p.salePrice || 0).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                    <Link to={`/admin-manager/products/${p._id}`} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#f8fafc] dark:bg-[#18181b] px-3 text-xs font-semibold text-[#0f172a] dark:text-[#f8fafc] transition-colors hover:bg-[#e2e8f0] dark:hover:bg-[#27272a]">
                      <LuEye className="h-3.5 w-3.5" /> Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#e5e7eb] dark:border-[#27272a] px-4 py-3 bg-[#ffffff] dark:bg-[#111113]">
            <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg border border-[#e5e7eb] dark:border-[#27272a] px-3 py-1 text-sm font-medium text-[#0f172a] dark:text-[#f8fafc] disabled:opacity-50"
              >
                Prev
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg border border-[#e5e7eb] dark:border-[#27272a] px-3 py-1 text-sm font-medium text-[#0f172a] dark:text-[#f8fafc] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;
