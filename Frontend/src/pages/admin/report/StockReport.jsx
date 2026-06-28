import { useState, useEffect } from "react";
import { useStockReport } from "../../../hooks/useStockReport";
import toast from "react-hot-toast";
import { adminSurface } from "../adminPageUi";
import useCurrent from "../../../hooks/auth/useCurrent";
import { api } from "../../../configs/api";
import dayjs from "dayjs";
import { FiEye, FiX } from "react-icons/fi";

function StockReport() {
  const { data: currentUser } = useCurrent();
  const isAdminManager = currentUser?.role === "ADMIN_MANAGER";

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
      if (e) toast.success("Filtered Successfully!");
    } else if (e) {
      toast.error(res?.error || "Failed to fetch report");
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
          <p className={adminSurface.eyebrow}>Reports</p>
          <h1 className={adminSurface.title}>Stock Report</h1>
          <p className={adminSurface.description}>
            View current stock, stock value, low stock, out of stock, and stock movement summary.
          </p>
        </div>
      </div>

      <div className={adminSurface.statGrid}>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>P</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>Total Products</p>
          <p className={adminSurface.statValue}>{summary.totalProducts || 0}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>Q</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>Total Stock Qty</p>
          <p className={adminSurface.statValue}>{summary.totalStockQuantity || 0}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>V</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>Total Stock Value</p>
          <p className={adminSurface.statValue}>${Number(summary.totalStockValue || 0).toFixed(2)}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>L</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>Low Stock Products</p>
          <p className={adminSurface.statValue}>{summary.lowStockProducts || 0}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>O</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>Out of Stock Products</p>
          <p className={adminSurface.statValue}>{summary.outOfStockProducts || 0}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>R</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>Received Qty</p>
          <p className={adminSurface.statValue}>{summary.receivedQty || 0}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>S</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>Sold Qty</p>
          <p className={adminSurface.statValue}>{summary.soldQty || 0}</p>
        </div>
        <div className={adminSurface.statCard}>
          <div className={adminSurface.statIcon}>A</div>
          <p className={`mt-4 ${adminSurface.statLabel}`}>Adjusted Qty</p>
          <p className={adminSurface.statValue}>{summary.adjustedQty || 0}</p>
        </div>
      </div>

      <div className={adminSurface.card}>
        <form onSubmit={handleFilter} className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Search (Name/SKU/Barcode)</label>
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
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Date From</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className={`${adminSurface.input} w-full`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Date To</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className={`${adminSurface.input} w-full`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Category</label>
            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              className={`${adminSurface.select} w-full`}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Supplier</label>
            <select
              name="supplierId"
              value={filters.supplierId}
              onChange={handleFilterChange}
              className={`${adminSurface.select} w-full`}
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className={`${adminSurface.select} w-full`}
            >
              <option value="">All Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          {isAdminManager && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Shop</label>
              <select
                name="shopId"
                value={filters.shopId}
                onChange={handleFilterChange}
                className={`${adminSurface.select} w-full`}
              >
                <option value="">All Shops</option>
                {shops.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 lg:col-span-1">
            <button type="submit" disabled={isLoading} className={`${adminSurface.primaryButton} flex-1`}>
              {isLoading ? "..." : "Filter"}
            </button>
            <button
              onClick={clearFilters}
              type="button"
              className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className={adminSurface.tableShell}>
        <div className={adminSurface.toolbar}>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Stock results</p>
          <p className="mt-1 text-xs text-slate-500">{products.length} product(s) found</p>
        </div>
        <div className={adminSurface.tableWrap}>
          <table className={`${adminSurface.table} min-w-[1200px]`}>
            <thead className={adminSurface.tableHead}>
              <tr>
                <th className={adminSurface.th}>Product</th>
                {isAdminManager && <th className={adminSurface.th}>Shop</th>}
                <th className={adminSurface.th}>SKU/Barcode</th>
                <th className={adminSurface.th}>Category</th>
                <th className={adminSurface.th}>Supplier</th>
                <th className={`${adminSurface.th} text-right`}>Current Stock</th>
                <th className={`${adminSurface.th} text-right`}>Base Unit</th>
                <th className={`${adminSurface.th} text-right`}>Low Threshold</th>
                <th className={adminSurface.th}>Status</th>
                <th className={`${adminSurface.th} text-right`}>Stock Value</th>
                <th className={`${adminSurface.th} text-right`}>Received</th>
                <th className={`${adminSurface.th} text-right`}>Sold</th>
                <th className={`${adminSurface.th} text-right`}>Adjusted</th>
                <th className={adminSurface.th}>Last Movement</th>
                <th className={`${adminSurface.th} text-center`}>Action</th>
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
                          {item.stockStatus === 'OUT_OF_STOCK' ? 'Out of Stock' : item.stockStatus === 'LOW_STOCK' ? 'Low Stock' : 'In Stock'}
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
                          title="View Movement"
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
                    {isLoading ? "Loading..." : "No stock report data found"}
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Stock Movement Detail</h2>
              <button onClick={closeMovementModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1">
              {isLoadingMovements ? (
                <p className="text-center text-slate-500">Loading...</p>
              ) : movements.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#2A2E36]">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-[#111318] text-slate-500 dark:text-[#6B7280]">
                      <tr>
                        <th className="px-4 py-3 font-semibold border-b border-slate-200 dark:border-[#2A2E36]">Date</th>
                        <th className="px-4 py-3 font-semibold border-b border-slate-200 dark:border-[#2A2E36]">Type</th>
                        <th className="px-4 py-3 font-semibold text-right border-b border-slate-200 dark:border-[#2A2E36]">Qty Change</th>
                        <th className="px-4 py-3 font-semibold text-right border-b border-slate-200 dark:border-[#2A2E36]">Before</th>
                        <th className="px-4 py-3 font-semibold text-right border-b border-slate-200 dark:border-[#2A2E36]">After</th>
                        <th className="px-4 py-3 font-semibold border-b border-slate-200 dark:border-[#2A2E36]">Reason</th>
                        <th className="px-4 py-3 font-semibold border-b border-slate-200 dark:border-[#2A2E36]">User</th>
                        <th className="px-4 py-3 font-semibold border-b border-slate-200 dark:border-[#2A2E36]">Note</th>
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
                <p className="text-center text-slate-500 py-8">No movement history found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockReport;
