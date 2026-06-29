import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../../utils/config/api";
import { getImageUrl } from "../../../utils/helpers/getImageUrl";
import {
  LuArrowLeft, LuPackageSearch, LuHistory, LuListOrdered
} from "react-icons/lu";
import {
  FaStore, FaBoxOpen, FaMoneyBillWave, FaTag, FaTruck, FaChartBar
} from "react-icons/fa6";
import { useTranslation } from "react-i18next";

const labelClass = "text-[11px] font-bold uppercase tracking-[0.08em] text-[#64748b] dark:text-[#a1a1aa]";
const valueClass = "mt-1 font-semibold text-[#0f172a] dark:text-[#f8fafc]";
const cardClass = "rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] p-6";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f1f5f9] dark:border-[#27272a] py-3 last:border-0">
      <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{label}</span>
      <span className="text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc] text-right max-w-[60%] truncate">{value || "—"}</span>
    </div>
  );
}

function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [sales, setSales] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodRes, movRes, saleRes] = await Promise.all([
          api.get(`/admin-manager/products/${id}`),
          api.get(`/inventory/movements`, { params: { productId: id, limit: 20 } }).catch(() => ({ data: { result: [] } })),
          api.get(`/sales`, { params: { productId: id, limit: 20 } }).catch(() => ({ data: { result: [] } })),
        ]);
        setProduct(prodRes.data?.result || null);
        setMovements(movRes.data?.result || []);
        setSales(saleRes.data?.result || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#06b6d4] border-t-transparent mb-4" />
          <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('loading_product_details')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <LuPackageSearch className="h-12 w-12 text-[#64748b] dark:text-[#a1a1aa]" />
        <p className="text-sm font-semibold text-red-500">{t('product_not_found')}</p>
        <Link to="/admin-manager/products" className="text-xs text-[#06b6d4] underline">
          {t('back_to_products_monitor')}
        </Link>
      </div>
    );
  }

  const { shopId } = product;
  const stockQty = product.stock ?? product.currentStock ?? 0;
  const stockStatus =
    stockQty <= 0 ? t('out_of_stock')
    : stockQty <= (product.reorderLevel || 5) ? t('low_stock')
    : t('in_stock');
  const statusBadge =
    stockStatus === t('out_of_stock') ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
    : stockStatus === t('low_stock') ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";

  const margin = product.costPrice && product.salePrice
    ? (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1)
    : "0.0";

  const tabs = [
    { id: "overview", label: t('overview'), icon: FaChartBar },
    { id: "movements", label: t('stock_movements'), icon: LuHistory },
    { id: "sales", label: t('sales_history'), icon: LuListOrdered },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa] mb-3">
          <Link to="/admin-manager/products" className="hover:text-[#06b6d4] transition-colors flex items-center gap-1">
            <LuArrowLeft className="h-3.5 w-3.5" /> {t('products_monitor')}
          </Link>
          <span>/</span>
          <span className="font-medium text-[#06b6d4] truncate max-w-[200px]">{product.name}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a] dark:text-[#f8fafc] md:text-3xl">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadge}`}>
                {stockStatus}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#f1f5f9] dark:bg-[#27272a] px-2.5 py-0.5 text-xs font-medium text-[#64748b] dark:text-[#a1a1aa]">
                {product.status || "ACTIVE"}
              </span>
              {product.category?.name && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#06b6d4]/10 px-2.5 py-0.5 text-xs font-semibold text-[#06b6d4]">
                  <FaTag className="h-3 w-3" /> {product.category.name}
                </span>
              )}
            </div>
          </div>
          <Link
            to="/admin-manager/products"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] px-4 text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc] hover:bg-[#f8fafc] dark:hover:bg-[#18181b] transition-colors"
          >
            <LuArrowLeft className="h-4 w-4" /> {t('back')}
          </Link>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Image + Key Info */}
        <div className="space-y-5">
          {/* Image / Name Card */}
          <div className={`${cardClass} text-center`}>
            {product.imageUrl ? (
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="mx-auto h-44 w-44 object-cover rounded-xl border border-[#e5e7eb] dark:border-[#27272a]"
              />
            ) : (
              <div className="mx-auto flex h-44 w-44 flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b]">
                <LuPackageSearch className="h-10 w-10 opacity-20 text-[#64748b]" />
                <span className="mt-2 text-xs text-[#64748b]">{t('no_image')}</span>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 text-left border-t border-[#f1f5f9] dark:border-[#27272a] pt-5">
              <div>
                <p className={labelClass}>{t('barcode')}</p>
                <p className={`${valueClass} text-sm`}>{product.barcode || t('n_a')}</p>
              </div>
              <div>
                <p className={labelClass}>{t('sku')}</p>
                <p className={`${valueClass} text-sm`}>{product.sku || t('n_a')}</p>
              </div>
              <div>
                <p className={labelClass}>{t('supplier')}</p>
                <p className={`${valueClass} text-sm`}>{product.supplier?.name || t('n_a')}</p>
              </div>
              <div>
                <p className={labelClass}>{t('created')}</p>
                <p className={`${valueClass} text-xs`}>
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : t('n_a')}
                </p>
              </div>
            </div>
          </div>

          {/* Shop Card */}
          <div className={cardClass}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <FaStore className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a] dark:text-[#f8fafc]">{t('shop_info')}</h3>
                <p className="text-xs text-[#64748b] dark:text-[#a1a1aa]">{t('platform_isolation')}</p>
              </div>
            </div>
            <Row label={t('shop_name')} value={shopId?.name} />
            <Row label={t('shop_code')} value={shopId?.code} />
            <Row label={t('owner_admin')} value={shopId?.ownerAdminId?.fullName || shopId?.ownerAdminId?.username} />
            <Row label={t('province')} value={shopId?.provinceEn || shopId?.provinceKh} />
            <Row label={t('shop_status')} value={shopId?.status} />
          </div>
        </div>

        {/* RIGHT: Tabs + Content */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t('current_stock'), value: stockQty, color: "text-[#06b6d4]", icon: FaBoxOpen },
              { label: t('sale_price'), value: `$${(product.salePrice || 0).toFixed(2)}`, color: "text-green-500", icon: FaMoneyBillWave },
              { label: t('cost_price'), value: `$${(product.costPrice || 0).toFixed(2)}`, color: "text-red-400", icon: FaTruck },
              { label: t('margin'), value: `${margin}%`, color: "text-purple-500", icon: FaTag },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className={`${cardClass} py-4 flex flex-col gap-2`}>
                <Icon className={`h-4 w-4 ${color}`} />
                <p className="text-xl font-bold text-[#0f172a] dark:text-[#f8fafc]">{value}</p>
                <p className="text-xs text-[#64748b] dark:text-[#a1a1aa]">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className={cardClass}>
            <div className="flex gap-1 border-b border-[#e5e7eb] dark:border-[#27272a] mb-5 -mx-6 px-6">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-3 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === id
                      ? "border-[#06b6d4] text-[#06b6d4]"
                      : "border-transparent text-[#64748b] dark:text-[#a1a1aa] hover:text-[#0f172a] dark:hover:text-[#f8fafc]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa] mb-3">{t('product_info')}</h4>
                  <div>
                    <Row label={t('product_name')} value={product.name} />
                    <Row label={t('description')} value={product.description || t('no_description')} />
                    <Row label={t('category')} value={product.category?.name} />
                    <Row label={t('supplier')} value={product.supplier?.name} />
                    <Row label={t('barcode')} value={product.barcode} />
                    <Row label={t('sku')} value={product.sku} />
                    <Row label={t('status')} value={product.status} />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa] mb-3">{t('stock_settings')}</h4>
                  <div>
                    <Row label={t('current_stock')} value={stockQty} />
                    <Row label={t('low_stock_threshold')} value={product.reorderLevel ?? product.lowStockThreshold ?? 5} />
                    <Row label={t('stock_status')} value={stockStatus} />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa] mb-3">{t('pricing')}</h4>
                  <div>
                    <Row label={t('cost_price')} value={`$${(product.costPrice || 0).toFixed(2)}`} />
                    <Row label={t('sale_price')} value={`$${(product.salePrice || 0).toFixed(2)}`} />
                    <Row label={t('margin')} value={`${margin}%`} />
                  </div>
                </div>
              </div>
            )}

            {/* Stock Movements Tab */}
            {activeTab === "movements" && (
              <div>
                {movements.length === 0 ? (
                  <div className="py-12 text-center">
                    <LuHistory className="mx-auto h-8 w-8 text-[#64748b] dark:text-[#a1a1aa] mb-3 opacity-40" />
                    <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('no_stock_movements_found')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-6">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b]">
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#64748b]">{t('date')}</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#64748b]">{t('type')}</th>
                          <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[#64748b]">{t('qty')}</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#64748b]">{t('note')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f1f5f9] dark:divide-[#27272a]">
                        {movements.map((m) => (
                          <tr key={m._id}>
                            <td className="px-4 py-3 text-[#64748b] dark:text-[#a1a1aa] whitespace-nowrap">
                              {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex rounded px-2 py-0.5 text-xs font-bold ${
                                m.type === "SALE" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                : m.type === "RECEIVE_STOCK" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-[#06b6d4]/10 text-[#06b6d4]"
                              }`}>{m.type}</span>
                            </td>
                            <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                              m.quantity < 0 ? "text-red-500" : "text-green-500"
                            }`}>
                              {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                            </td>
                            <td className="px-4 py-3 text-[#64748b] dark:text-[#a1a1aa] max-w-[200px] truncate">{m.note || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Sales History Tab */}
            {activeTab === "sales" && (
              <div>
                {sales.length === 0 ? (
                  <div className="py-12 text-center">
                    <LuListOrdered className="mx-auto h-8 w-8 text-[#64748b] dark:text-[#a1a1aa] mb-3 opacity-40" />
                    <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('no_sales_history_found')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-6">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b]">
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#64748b]">{t('date')}</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#64748b]">{t('invoice')}</th>
                          <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[#64748b]">{t('total')}</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#64748b]">{t('cashier')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f1f5f9] dark:divide-[#27272a]">
                        {sales.map((s) => (
                          <tr key={s._id}>
                            <td className="px-4 py-3 text-[#64748b] dark:text-[#a1a1aa] whitespace-nowrap">
                              {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-[#0f172a] dark:text-[#f8fafc]">
                              {s.invoiceNumber || s._id?.toString().slice(-6)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                              ${(s.totalCost || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-[#64748b] dark:text-[#a1a1aa]">
                              {s.user?.username || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
