import { useState, useEffect } from "react";
import { useStockReport } from "../../../hooks/reports/useStockReport";
import toast from "react-hot-toast";
import { adminSurface } from "../adminPageUi";
import useCurrent from "../../../hooks/auth/useCurrent";
import { api } from "../../../utils/config/api";
import dayjs from "dayjs";
import { FiEye, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

function StockReport() {
  const { data: currentUser } = useCurrent();
  const isAdminManager = currentUser?.role === "ADMIN_MANAGER";
  const { t } = useTranslation();

  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    categoryId: "",
    supplierId: "",
    status: "",
    shopId: "",
  });

  const [reportData, setReportData] = useState({ result: [], summary: {} });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [shops, setShops] = useState([]);
  
  const [movements, setMovements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);

  const { fetchStockReport, isLoading } = useStockReport();

  const handleFilter = async (e) => {
    if (e) e.preventDefault();
    
    const activeFilters = {};
    for (const key in filters) {
      if (filters[key]) activeFilters[key] = filters[key];
    }

    const res = await fetchStockReport(activeFilters);
    if (res?.success) {
      setReportData({ result: res.result, summary: res.summary });
      if (e) toast.success(t('filtered_success'));
    } else if (e) {
      toast.error(res?.error || t('failed_fetch_report'));
    }
  };

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const catRes = await api.get('/categories?limit=1000');
        setCategories(catRes.data?.result || []);
        
        const supRes = await api.get('/suppliers?limit=1000');
        setSuppliers(supRes.data?.result || []);

        if (isAdminManager) {
          const shopRes = await api.get('/admin-manager/shops?limit=1000');
          setShops(shopRes.data?.result || []);
        }
      } catch (err) {
        console.error("Failed to load dropdowns:", err);
      }
    };
    if (currentUser) {
      fetchDropdowns();
      handleFilter(); // initial load
    }
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearFilters = () => {
    setFilters({
      search: "",
      dateFrom: "",
      dateTo: "",
      categoryId: "",
      supplierId: "",
      status: "",
      shopId: "",
    });
    setReportData({ result: [], summary: {} });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openMovementModal = async (productId) => {
    setIsModalOpen(true);
    setIsLoadingMovements(true);
    try {
      const res = await api.get(`/stock-movements?productId=${productId}`);
      if (res.data?.success) {
        setMovements(res.data.result);
      } else {
        toast.error("Failed to load stock movements");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading stock movements");
    } finally {
      setIsLoadingMovements(false);
    }
  };

  const closeMovementModal = () => {
    setIsModalOpen(false);
    setMovements([]);
  };

  const summary = reportData.summary || {};
  const products = reportData.result || [];

  return (
    <div className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>{t('reports')}</p>
          <h1 className={adminSurface.title}>{t('stock_report')}</h1>
          <p className={adminSurface.description}>
            {t('stock_report_desc')}
          </p>
        </div>
      </div>

      <div className={adminSurface.statGrid}>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>P</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>{t('total_products')}</p>
          <p className={adminSurface.statValue}>{summary.totalProducts || 0}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>Q</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>{t('total_stock_qty')}</p>
          <p className={adminSurface.statValue}>{summary.totalStockQuantity || 0}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>V</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>{t('total_stock_value')}</p>
          <p className={adminSurface.statValue}>${Number(summary.totalStockValue || 0).toFixed(2)}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>L</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>{t('low_stock_products')}</p>
          <p className={adminSurface.statValue}>{summary.lowStockProducts || 0}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>O</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>{t('out_of_stock_products')}</p>
          <p className={adminSurface.statValue}>{summary.outOfStockProducts || 0}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>R</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>{t('received_qty')}</p>
          <p className={adminSurface.statValue}>{summary.receivedQty || 0}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>S</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>{t('sold_qty')}</p>
          <p className={adminSurface.statValue}>{summary.soldQty || 0}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>A</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>{t('adjusted_qty')}</p>
          <p className={adminSurface.statValue}>{summary.adjustedQty || 0}</p>
        </div>
      </div>

      <div className={adminSurface.card}>
        <form onSubmit={handleFilter} className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('search_name_sku_barcode')}</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className={`${adminSurface.input} w-full`}
              placeholder="Search..."
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('date_from')}</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className={`${adminSurface.input} w-full`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('date_to')}</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className={`${adminSurface.input} w-full`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('category')}</label>
            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              className={`${adminSurface.select} w-full`}
            >
              <option value="">{t('all_categories')}</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('supplier')}</label>
            <select
              name="supplierId"
              value={filters.supplierId}
              onChange={handleFilterChange}
              className={`${adminSurface.select} w-full`}
            >
              <option value="">{t('all_suppliers')}</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('status')}</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className={`${adminSurface.select} w-full`}
            >
              <option value="">{t('all_statuses')}</option>
              <option value="IN_STOCK">{t('in_stock')}</option>
              <option value="LOW_STOCK">{t('low_stock')}</option>
              <option value="OUT_OF_STOCK">{t('out_of_stock')}</option>
            </select>
          </div>

          {isAdminManager && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('shop')}</label>
              <select
                name="shopId"
                value={filters.shopId}
                onChange={handleFilterChange}
                className={`${adminSurface.select} w-full`}
              >
                <option value="">{t('all_shops')}</option>
                {shops.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 lg:col-span-1">
            <button type="submit" disabled={isLoading} className={`${adminSurface.primaryButton} flex-1`}>
              {isLoading ? "..." : t('filter')}
            </button>
            <button
              onClick={clearFilters}
              type="button"
              className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
            >
              {t('reset')}
            </button>
          </div>
        </form>
      </div>

      <div className={adminSurface.tableShell}>
        <div className={adminSurface.toolbar}>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('stock_results')}</p>
          <p className="mt-1 text-xs text-slate-500">{products.length} {t('products_found')}</p>
        </div>
        <div className={adminSurface.tableWrap}>
          <table className={`${adminSurface.table} min-w-[1200px]`}>
            <thead className={adminSurface.tableHead}>
              <tr>
                <th className={adminSurface.th}>{t('product')}</th>
                {isAdminManager && <th className={adminSurface.th}>{t('shop')}</th>}
                <th className={adminSurface.th}>{t('sku_barcode')}</th>
                <th className={adminSurface.th}>{t('category')}</th>
                <th className={adminSurface.th}>{t('supplier')}</th>
                <th className={`${adminSurface.th} text-right`}>{t('current_stock')}</th>
                <th className={`${adminSurface.th} text-right`}>{t('base_unit')}</th>
                <th className={`${adminSurface.th} text-right`}>{t('low_threshold')}</th>
                <th className={adminSurface.th}>{t('status')}</th>
                <th className={`${adminSurface.th} text-right`}>{t('stock_value')}</th>
                <th className={`${adminSurface.th} text-right`}>{t('received')}</th>
                <th className={`${adminSurface.th} text-right`}>{t('sold')}</th>
                <th className={`${adminSurface.th} text-right`}>{t('adjusted')}</th>
                <th className={adminSurface.th}>{t('last_movement')}</th>
                <th className={`${adminSurface.th} text-center`}>{t('actions')}</th>
              </tr>
            </thead>

            {products.length > 0 ? (
              <tbody>
                {products.map((item, index) => {
                  let statusBadge;
                  if (item.stockStatus === 'OUT_OF_STOCK') {
                    statusBadge = "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
                  } else if (item.stockStatus === 'LOW_STOCK') {
                    statusBadge = "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50";
                  } else {
                    statusBadge = "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
                  }
                  
                  return (
                    <tr key={index} className={adminSurface.row}>
                      <td className={`${adminSurface.td} font-semibold text-slate-900 dark:text-slate-100`}>{item.productName}</td>
                      {isAdminManager && <td className={`${adminSurface.td} text-slate-600 dark:text-slate-400`}>{item.shopName || '-'}</td>}
                      <td className={`${adminSurface.td} font-semibold uppercase text-slate-700 dark:text-slate-300`}>
                        {item.sku || item.barcode || '-'}
                      </td>
                      <td className={`${adminSurface.td} text-slate-600 dark:text-slate-400`}>{item.categoryName || '-'}</td>
                      <td className={`${adminSurface.td} text-slate-600 dark:text-slate-400`}>{item.supplierName || '-'}</td>
                      <td className={`${adminSurface.td} text-right font-bold text-slate-900 dark:text-white`}>{item.currentStock}</td>
                      <td className={`${adminSurface.td} text-right text-slate-600 dark:text-slate-400`}>{item.baseUnit || '-'}</td>
                      <td className={`${adminSurface.td} text-right text-slate-600 dark:text-slate-400`}>{item.lowStockThreshold}</td>
                      <td className={adminSurface.td}>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge}`}>
                          {item.stockStatus === 'OUT_OF_STOCK' ? t('out_of_stock') : item.stockStatus === 'LOW_STOCK' ? t('low_stock') : t('in_stock')}
                        </span>
                      </td>
                      <td className={`${adminSurface.td} text-right font-semibold text-slate-900 dark:text-white`}>${Number(item.stockValue).toFixed(2)}</td>
                      <td className={`${adminSurface.td} text-right text-green-600 dark:text-green-400 font-medium`}>{item.receivedQty}</td>
                      <td className={`${adminSurface.td} text-right text-blue-600 dark:text-blue-400 font-medium`}>{item.soldQty}</td>
                      <td className={`${adminSurface.td} text-right text-orange-600 dark:text-orange-400 font-medium`}>{item.adjustedQty}</td>
                      <td className={`${adminSurface.td} text-slate-600 dark:text-slate-400`}>
                        {item.lastMovementAt ? dayjs(item.lastMovementAt).format('YYYY-MM-DD HH:mm') : '-'}
                      </td>
                      <td className={`${adminSurface.td} text-center`}>
                        <button
                          onClick={() => openMovementModal(item.productId)}
                          className={adminSurface.iconButton}
                          title={t('view_movement')}
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={15} className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    {isLoading ? t('loading') : t('no_stock_report_data')}
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-[#1A1D22] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A2E36] p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('stock_movement_detail')}</h2>
              <button onClick={closeMovementModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1">
              {isLoadingMovements ? (
                <p className="text-center text-slate-500">{t('loading')}</p>
              ) : movements.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#2A2E36]">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-[#111318] text-slate-500 dark:text-[#6B7280]">
                      <tr>
                        <th className="px-4 py-3 font-semibold border-b border-slate-200 dark:border-[#2A2E36]">{t('date')}</th>
                        <th className="px-4 py-3 font-semibold border-b border-slate-200 dark:border-[#2A2E36]">{t('type')}</th>
                        <th className="px-4 py-3 font-semibold text-right border-b border-slate-200 dark:border-[#2A2E36]">{t('qty_change')}</th>
                        <th className="px-4 py-3 font-semibold text-right border-b border-slate-200 dark:border-[#2A2E36]">{t('before')}</th>
                        <th className="px-4 py-3 font-semibold text-right border-b border-slate-200 dark:border-[#2A2E36]">{t('after')}</th>
                        <th className="px-4 py-3 font-semibold border-b border-slate-200 dark:border-[#2A2E36]">{t('reason')}</th>
                        <th className="px-4 py-3 font-semibold border-b border-slate-200 dark:border-[#2A2E36]">{t('user')}</th>
                        <th className="px-4 py-3 font-semibold border-b border-slate-200 dark:border-[#2A2E36]">{t('note')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((m, i) => (
                        <tr key={m._id || i} className="border-b border-slate-100 dark:border-[#2A2E36] hover:bg-slate-50 dark:hover:bg-[#22262D]">
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {dayjs(m.createdAt).format('YYYY-MM-DD HH:mm')}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                            {m.type}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${m.qtyChange > 0 ? 'text-green-600 dark:text-green-400' : m.qtyChange < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            {m.qtyChange > 0 ? `+${m.qtyChange}` : m.qtyChange}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{m.beforeQty || m.quantityBefore}</td>
                          <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">{m.afterQty || m.quantityAfter}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-xs">{m.reason || '-'}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.user?.username || m.createdBy?.username || '-'}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-xs">{m.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">{t('no_movement_history')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockReport;
