import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../../configs/api";
import { baseUrl } from "../../../configs/env";
import { LuArrowLeft, LuPackageSearch, LuHistory, LuListOrdered } from "react-icons/lu";
import { FaStore, FaBoxOpen, FaMoneyBillWave, FaShieldHalved } from "react-icons/fa6";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/admin-manager/products/${id}`);
        setProduct(res.data?.result || res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-[#64748b] dark:text-[#a1a1aa]">Loading product details...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center text-red-500">Product not found</div>;
  }

  const { shopId } = product;
  const stockQty = product.stock ?? product.currentStock ?? 0;

  const stockStatus = stockQty <= 0 ? "Out of Stock" : stockQty <= (product.reorderLevel || 5) ? "Low Stock" : "In Stock";
  const statusColor = stockStatus === "Out of Stock" ? "text-red-600 bg-red-100 dark:bg-red-900/30" : stockStatus === "Low Stock" ? "text-amber-600 bg-amber-100 dark:bg-amber-900/30" : "text-green-600 bg-green-100 dark:bg-green-900/30";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa] mb-2">
            <Link to="/admin-manager/products" className="hover:text-[#7033ff] transition-colors">Products Monitor</Link>
            <span>/</span>
            <span className="font-medium text-[#7033ff]">Product Details</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#0f172a] dark:text-[#f8fafc] md:text-3xl">Product: {product.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-4 text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc] transition-colors hover:bg-[#f8fafc] dark:hover:bg-[#18181b]">
            <LuHistory className="h-4 w-4" /> Stock Movements
          </button>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-4 text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc] transition-colors hover:bg-[#f8fafc] dark:hover:bg-[#18181b]">
            <LuListOrdered className="h-4 w-4" /> Sales History
          </button>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-4 text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc] transition-colors hover:bg-[#f8fafc] dark:hover:bg-[#18181b]">
            <FaShieldHalved className="h-4 w-4" /> Audit Log
          </button>
          <Link to="/admin-manager/products" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0f172a] dark:bg-[#f8fafc] px-4 text-sm font-semibold text-white dark:text-[#0f172a] transition-colors hover:bg-slate-800 dark:hover:bg-slate-200">
            <LuArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Info */}
          <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] p-6 text-center">
            {product.imageUrl ? (
              <img src={`${baseUrl}/upload/${product.imageUrl}`} alt={product.name} className="mx-auto h-48 w-48 object-cover rounded-xl border border-[#e5e7eb] dark:border-[#27272a]" />
            ) : (
              <div className="mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa]">
                <LuPackageSearch className="h-10 w-10 mb-2 opacity-20" />
                <span className="text-sm font-medium">No Image</span>
              </div>
            )}
            <h2 className="mt-5 text-xl font-bold text-[#0f172a] dark:text-[#f8fafc]">{product.name}</h2>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}>
                {stockStatus}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#f1f5f9] dark:bg-[#27272a] px-2.5 py-0.5 text-xs font-medium text-[#64748b] dark:text-[#a1a1aa]">
                {product.status || "ACTIVE"}
              </span>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#e5e7eb] dark:border-[#27272a] pt-6 text-left">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">Barcode</p>
                <p className="mt-1 font-semibold text-[#0f172a] dark:text-[#f8fafc]">{product.barcode || "N/A"}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">SKU</p>
                <p className="mt-1 font-semibold text-[#0f172a] dark:text-[#f8fafc]">{product.sku || "N/A"}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">Category</p>
                <p className="mt-1 font-semibold text-[#0f172a] dark:text-[#f8fafc]">{product.category?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">Supplier</p>
                <p className="mt-1 font-semibold text-[#0f172a] dark:text-[#f8fafc]">{product.supplier?.name || "N/A"}</p>
              </div>
            </div>
          </div>
          
          {/* Shop Info */}
          <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <FaStore className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] dark:text-[#f8fafc]">Shop Information</h3>
                <p className="text-xs text-[#64748b] dark:text-[#a1a1aa]">Platform isolation layer</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b border-[#e5e7eb] dark:border-[#27272a] pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-[#64748b] dark:text-[#a1a1aa]">Shop Name</span>
                <span className="text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc]">{shopId?.name || "Unknown"}</span>
              </div>
              <div className="flex justify-between border-b border-[#e5e7eb] dark:border-[#27272a] pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-[#64748b] dark:text-[#a1a1aa]">Shop Code</span>
                <span className="text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc]">{shopId?.code || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-[#e5e7eb] dark:border-[#27272a] pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-[#64748b] dark:text-[#a1a1aa]">Owner/Admin</span>
                <span className="text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                  {shopId?.ownerAdminId?.fullName || shopId?.ownerAdminId?.username || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#e5e7eb] dark:border-[#27272a] pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-[#64748b] dark:text-[#a1a1aa]">Location</span>
                <span className="text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                  {shopId?.provinceEn || shopId?.provinceKh || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock & Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7033ff]/10 text-[#7033ff]">
                  <FaBoxOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0f172a] dark:text-[#f8fafc]">Inventory Status</h3>
                  <p className="text-xs text-[#64748b] dark:text-[#a1a1aa]">Real-time stock level</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Current Stock</p>
                  <p className="text-2xl font-bold text-[#7033ff]">{stockQty}</p>
                </div>
                <div className="pt-2">
                  <p className="text-xs font-medium text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Low Stock Threshold</p>
                  <p className="text-lg font-semibold text-[#0f172a] dark:text-[#f8fafc]">{product.reorderLevel || 5}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <FaMoneyBillWave className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0f172a] dark:text-[#f8fafc]">Pricing</h3>
                  <p className="text-xs text-[#64748b] dark:text-[#a1a1aa]">Cost and sales margins</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">Cost Price</p>
                    <p className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">
                      ${(product.costPrice || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">Sale Price</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      ${(product.salePrice || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
