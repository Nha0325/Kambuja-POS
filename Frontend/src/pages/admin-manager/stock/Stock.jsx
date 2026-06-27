import { useCallback, useEffect, useMemo, useState } from "react"
import { FaDownload, FaMagnifyingGlass, FaTriangleExclamation, FaFilter, FaXmark, FaEye, FaPenToSquare, FaClockRotateLeft } from "react-icons/fa6"
import { adminService } from "../../../services/admin.service"
import { downloadCsv } from "../../../utils/downloadCsv"
import { formatApiError } from "../../../utils/formatApiError"
import {
  cardClass,
  inputClass,
  selectClass,
  primaryButtonClass,
  tableCellClass,
  tableHeadCellClass,
  tableHeadClass,
  modalClass,
} from "../adminManagerUi"
import { PageHeader, TableEmpty } from "../components/AdminManagerUi"

function getShopName(row) {
  if (row.shopId && typeof row.shopId === "object") return row.shopId.name || row.shopId.code || "-"
  return row.shopId || "-"
}

const getStockPercent = (row) => {
  const maxStock = Number(row.maxStock || 0);
  const quantity = Number(row.quantity || 0);
  if (maxStock <= 0) return null;
  return Math.round((quantity / maxStock) * 100);
};

// Returns "OUT" | "LOW" | "OK"
const getStockStatus = (row) => {
  const quantity = Number(row.quantity || 0);
  const reorderLevel = Number(row.reorderLevel || 0);
  if (quantity <= 0) return "OUT";
  if (quantity <= reorderLevel) return "LOW";
  return "OK";
};

function Stock() {
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  
  const [shopFilter, setShopFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [statFilter, setStatFilter] = useState("ALL")
  
  const [selectedRow, setSelectedRow] = useState(null)
  
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyData, setHistoryData] = useState([])

  const loadStock = useCallback(() => {
    setIsLoading(true)
    setError("")
    return adminService.inventory()
      .then((response) => setRows(response.data.result || []))
      .catch((loadError) => {
        if (loadError?.response?.status !== 401) {
          setError(formatApiError(loadError) || "Unable to load stock")
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadStock()
  }, [loadStock])

  // Escape key handler for modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setSelectedRow(null)
        setShowHistory(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const loadHistory = async (row) => {
    const targetRow = row || selectedRow;
    if (!targetRow) return;
    
    if (row) {
       setSelectedRow(row);
    }
    
    setShowHistory(true)
    setHistoryLoading(true)
    
    try {
        const res = await adminService.inventoryMovements();
        const allMovements = res.data?.result || [];
        const filtered = allMovements.filter(m => {
             const mProdId = typeof m.product === 'object' ? m.product?._id : m.product;
             const mShopId = typeof m.shopId === 'object' ? m.shopId?._id : m.shopId;
             
             const rProdId = typeof targetRow.product === 'object' ? targetRow.product?._id : targetRow.product;
             const rShopId = typeof targetRow.shopId === 'object' ? targetRow.shopId?._id : targetRow.shopId;
             
             return mProdId === rProdId && mShopId === rShopId;
        });
        setHistoryData(filtered);
    } catch (err) {
        console.error(err);
    } finally {
        setHistoryLoading(false);
    }
  }

  // Derive unique lists for filters
  const shopsList = useMemo(() => {
    const list = new Set()
    rows.forEach(r => list.add(getShopName(r)))
    return Array.from(list).filter(Boolean).sort()
  }, [rows])

  const categoriesList = useMemo(() => {
    const list = new Set()
    rows.forEach(r => {
      const cat = r.product?.category?.name || r.category || r.product?.category
      if (cat && typeof cat === 'string') list.add(cat)
    })
    return Array.from(list).sort()
  }, [rows])

  const displayedRows = useMemo(() => {
    const term = search.trim().toLowerCase()

    return rows.filter((row) => {
      // 1. Search filter
      const matchesSearch = !term || (
        row.product?.name?.toLowerCase().includes(term) ||
        row.product?.code?.toLowerCase().includes(term) ||
        getShopName(row).toLowerCase().includes(term)
      )
      if (!matchesSearch) return false

      // 2. Shop filter
      if (shopFilter !== "ALL" && getShopName(row) !== shopFilter) return false

      // 3. Category filter
      if (categoryFilter !== "ALL") {
        const cat = row.product?.category?.name || row.category || row.product?.category
        if (cat !== categoryFilter) return false
      }

      // 4. Status Dropdown Filter
      const status = getStockStatus(row)
      if (statusFilter === "LOW" && (status !== "LOW" && status !== "OUT")) return false
      if (statusFilter === "OK" && status !== "OK") return false
      if (statusFilter === "OUT" && status !== "OUT") return false

      // 5. Stat Card Filter
      if (statFilter === "LOW" && (status !== "LOW" && status !== "OUT")) return false
      if (statFilter === "OK" && status !== "OK") return false

      return true
    })
  }, [rows, search, shopFilter, categoryFilter, statusFilter, statFilter])

  const totalQuantity = rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
  const lowStockCount = rows.filter((row) => {
     const s = getStockStatus(row);
     return s === "LOW" || s === "OUT";
  }).length
  const outOfStockCount = rows.filter((row) => getStockStatus(row) === "OUT").length
  const healthyCount = rows.filter((row) => getStockStatus(row) === "OK").length

  const exportStock = () => {
    downloadCsv(
      "admin-manager-stock.csv",
      [
        { label: "Shop", value: (row) => getShopName(row) },
        { label: "Product", value: (row) => row.product?.name || "" },
        { label: "Code", value: (row) => row.product?.code || "" },
        { label: "Quantity", value: (row) => Number(row.quantity || 0) },
        { label: "Max Stock", value: (row) => Number(row.maxStock || 0) },
        { label: "Stock %", value: (row) => {
            const p = getStockPercent(row);
            return p !== null ? `${p}%` : "N/A";
        } },
        { label: "Reorder Level", value: (row) => Number(row.reorderLevel || 0) },
        { label: "Status", value: (row) => {
            const s = getStockStatus(row);
            return s === "OUT" ? "OUT OF STOCK" : s === "LOW" ? "LOW" : "OK";
        } },
      ],
      displayedRows
    )
  }

  const handleLowStockAlertClick = () => {
    if (statFilter === "LOW") {
      setStatFilter("ALL")
    } else {
      setStatFilter("LOW")
    }
  }

  return (
    <section className="max-w-[1600px] mx-auto flex flex-col gap-6">
      <PageHeader
        title="Stock Overview"
        description="Monitor product quantities, reorder levels, and low-stock signals across shops."
        action={(
          <button className={primaryButtonClass} type="button" onClick={exportStock} disabled={displayedRows.length === 0}>
            <FaDownload />
            Export
          </button>
        )}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-700 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      {lowStockCount > 0 && (
        <div 
          onClick={handleLowStockAlertClick}
          className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-400">
            <FaTriangleExclamation />
            <span>
              <strong>Low stock alert:</strong>{" "}
              {lowStockCount} product(s) are at or below reorder level.
              {outOfStockCount > 0 && (
                <span className="ml-1 font-semibold text-red-700 dark:text-red-400">
                  ({outOfStockCount} out of stock)
                </span>
              )}
            </span>
          </div>
          <div className="text-sm font-semibold text-amber-800 dark:text-amber-400 underline underline-offset-2">
            {statFilter === "LOW" ? "Clear filter" : "View low stock"}
          </div>
        </div>
      )}

      {statFilter !== "ALL" && (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-[#7033ff]/10 dark:bg-[#7033ff]/20 text-[#7033ff] px-3 py-1.5 rounded-full text-sm font-bold border border-[#7033ff]/20">
            Showing: {statFilter === "LOW" ? "Low Stock" : "Healthy Stock"}
            <button 
              onClick={() => setStatFilter("ALL")}
              className="hover:bg-[#7033ff]/20 p-0.5 rounded-full transition-colors flex items-center justify-center"
            >
              <FaXmark />
            </button>
          </div>
        </div>
      )}

      {/* Clickable Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {[
          { label: "Products", value: rows.length, filter: "ALL" },
          { label: "Total Quantity", value: totalQuantity, filter: "ALL" },
          { label: "Low Stock", value: lowStockCount, filter: "LOW" },
          { label: "Healthy", value: healthyCount, filter: "OK" },
        ].map((card) => (
          <article 
            key={card.label} 
            onClick={() => setStatFilter(card.filter)}
            className={`${cardClass} p-5 cursor-pointer transition-colors hover:border-[#7033ff] ${statFilter === card.filter && card.filter !== 'ALL' ? 'border-[#7033ff] ring-1 ring-[#7033ff]' : ''}`}
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa]">{card.label}</p>
            <strong className="block text-2xl font-bold text-[#020617] dark:text-[#f8fafc]">{Number(card.value || 0).toLocaleString()}</strong>
          </article>
        ))}
      </div>

      {/* Filters Bar */}
      <div className={`${cardClass} p-4 flex flex-col md:flex-row gap-4 items-center`}>
        <label className="relative w-full md:w-auto flex-1 max-w-md">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa]" />
          <input
            className={`${inputClass} pl-10`}
            placeholder="Search by shop, product, or code..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
          <div className="relative min-w-[140px] flex-1 md:flex-none">
             <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa] text-xs" />
             <select className={`${selectClass} pl-8`} value={shopFilter} onChange={(e) => setShopFilter(e.target.value)}>
                <option value="ALL">All Shops</option>
                {shopsList.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>

          <div className="relative min-w-[140px] flex-1 md:flex-none">
             <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Status</option>
                <option value="LOW">Low Stock</option>
                <option value="OK">Healthy</option>
                <option value="OUT">Out of Stock</option>
             </select>
          </div>

          {categoriesList.length > 0 && (
             <div className="relative min-w-[140px] flex-1 md:flex-none">
               <select className={selectClass} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="ALL">All Categories</option>
                  {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
          )}
        </div>
      </div>

      {/* Table Data */}
      <div className={`${cardClass} overflow-hidden flex flex-col`}>
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Shop</th>
                <th className={tableHeadCellClass}>Product</th>
                <th className={tableHeadCellClass}>Code</th>
                <th className={`${tableHeadCellClass} text-right`}>Quantity</th>
                <th className={`${tableHeadCellClass} text-right`}>Max Stock</th>
                <th className={`${tableHeadCellClass} text-right`}>Stock %</th>
                <th className={`${tableHeadCellClass} text-right`}>Reorder Level</th>
                <th className={`${tableHeadCellClass} text-center`}>Status</th>
                <th className={`${tableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {isLoading ? (
                <TableEmpty colSpan="9">Loading stock...</TableEmpty>
              ) : displayedRows.length === 0 ? (
                <TableEmpty colSpan="9">
                  {search || shopFilter !== "ALL" || statusFilter !== "ALL" || categoryFilter !== "ALL" || statFilter !== "ALL" ? "No result matches your search/filters." : "No stock records found."}
                </TableEmpty>
              ) : displayedRows.map((row) => {
                const status = getStockStatus(row)
                const percent = getStockPercent(row)

                const badgeClass =
                  status === "OUT"
                    ? "inline-flex items-center gap-1.5 rounded-full border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-400"
                    : status === "LOW"
                    ? "inline-flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400"
                    : "inline-flex items-center gap-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400"

                return (
                  <tr 
                    key={row._id} 
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer group"
                    onClick={() => { setSelectedRow(row); setShowHistory(false); }}
                  >
                    <td className={tableCellClass}>{getShopName(row)}</td>
                    <td className={`${tableCellClass} font-bold text-[#020617] dark:text-[#f8fafc]`}>{row.product?.name || "-"}</td>
                    <td className={`${tableCellClass} font-mono text-[#7033ff]`}>{row.product?.code || "-"}</td>
                    <td className={`${tableCellClass} text-right font-bold`}>{Number(row.quantity || 0).toLocaleString()}</td>
                    <td className={`${tableCellClass} text-right`}>{Number(row.maxStock || 0) > 0 ? Number(row.maxStock).toLocaleString() : "-"}</td>
                    <td className={`${tableCellClass} text-right`}>{percent !== null ? `${percent}%` : "-"}</td>
                    <td className={`${tableCellClass} text-right`}>{Number(row.reorderLevel || 0).toLocaleString()}</td>
                    <td className={`${tableCellClass} text-center`}>
                      <span className={badgeClass}>
                        {status !== "OK" && <FaTriangleExclamation />}
                        {status === "OUT" ? "OUT OF STOCK" : status}
                      </span>
                    </td>
                    <td className={`${tableCellClass} text-right`}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedRow(row); setShowHistory(false); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] hover:text-blue-600 hover:bg-blue-600/10 transition-colors" 
                          title="View"
                        >
                          <FaEye className="text-[16px]" />
                        </button>
                        <button 
                          disabled
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] opacity-50 cursor-not-allowed" 
                          title="Admin Only: Stock adjustment is handled by shop admins"
                        >
                          <FaPenToSquare className="text-[16px]" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); loadHistory(row); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] hover:text-[#7033ff] hover:bg-[#7033ff]/10 transition-colors" 
                          title="Stock History"
                        >
                          <FaClockRotateLeft className="text-[16px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row Detail Modal */}
      {selectedRow && (
        <div className={modalClass} onClick={() => { setSelectedRow(null); setShowHistory(false); }}>
          <div className="bg-[#ffffff] dark:bg-[#111113] rounded-xl w-full max-w-2xl overflow-hidden border border-[#e5e7eb] dark:border-[#27272a] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-[#e5e7eb] dark:border-[#27272a]">
              <h3 className="text-xl font-bold text-[#020617] dark:text-[#f8fafc] flex items-center gap-2">
                {showHistory ? "Stock History" : "Stock Details"}
              </h3>
              <button 
                onClick={() => { setSelectedRow(null); setShowHistory(false); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] hover:bg-[#f8fafc] dark:hover:bg-[#09090b] hover:text-[#020617] dark:hover:text-[#f8fafc] transition-colors"
              >
                <FaXmark />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] min-h-[300px]">
              {showHistory ? (
                   historyLoading ? (
                       <div className="flex items-center justify-center h-full min-h-[200px] text-[#64748b] dark:text-[#a1a1aa]">Loading history...</div>
                   ) : historyData.length === 0 ? (
                       <div className="flex items-center justify-center h-full min-h-[200px] text-[#64748b] dark:text-[#a1a1aa]">No stock movements found.</div>
                   ) : (
                       <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse text-sm">
                               <thead className="border-b border-[#e5e7eb] dark:border-[#27272a] text-[#64748b] dark:text-[#a1a1aa] uppercase text-[11px] tracking-wider font-bold">
                                  <tr>
                                     <th className="pb-3 pr-4">Date</th>
                                     <th className="pb-3 pr-4">Type</th>
                                     <th className="pb-3 pr-4 text-right">Qty</th>
                                     <th className="pb-3 pr-4">Reason / Note</th>
                                     <th className="pb-3">User</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
                                  {historyData.map(h => (
                                     <tr key={h._id} className="hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors">
                                        <td className="py-3 pr-4 text-[#020617] dark:text-[#f8fafc] whitespace-nowrap">
                                           {new Date(h.createdAt).toLocaleDateString()} {new Date(h.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </td>
                                        <td className="py-3 pr-4 font-bold text-[#7033ff] text-xs uppercase tracking-wider">{h.type}</td>
                                        <td className="py-3 pr-4 text-right font-mono font-bold text-[#020617] dark:text-[#f8fafc]">
                                            {h.quantity > 0 && h.type === 'STOCK_IN' ? `+${h.quantity}` : h.quantity}
                                        </td>
                                        <td className="py-3 pr-4 text-[#64748b] dark:text-[#a1a1aa] text-xs max-w-[200px] truncate" title={h.note || "-"}>{h.note || "-"}</td>
                                        <td className="py-3 text-[#020617] dark:text-[#f8fafc] truncate max-w-[120px]">{h.user?.name || h.user?.username || "-"}</td>
                                     </tr>
                                  ))}
                               </tbody>
                           </table>
                       </div>
                   )
              ) : (
                  <div className="grid grid-cols-2 gap-y-6 gap-x-6">
                    <div>
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Product</p>
                      <p className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedRow.product?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Code</p>
                      <p className="text-sm font-bold text-[#7033ff] font-mono">{selectedRow.product?.code || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Shop</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{getShopName(selectedRow)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Category</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedRow.product?.category?.name || selectedRow.category || "Uncategorized"}</p>
                    </div>
                    
                    <div className="col-span-2 pt-4 border-t border-[#e5e7eb] dark:border-[#27272a]">
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-3">Stock Information</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#f8fafc] dark:bg-[#09090b] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#27272a]">
                        <div className="flex flex-col items-center justify-center text-center">
                           <span className="text-2xl font-bold text-[#020617] dark:text-[#f8fafc]">{Number(selectedRow.quantity || 0).toLocaleString()}</span>
                           <span className="text-[10px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase mt-1">Quantity</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center border-l border-[#e5e7eb] dark:border-[#27272a]">
                           <span className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">{Number(selectedRow.reorderLevel || 0).toLocaleString()}</span>
                           <span className="text-[10px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase mt-1">Reorder</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center border-l border-[#e5e7eb] dark:border-[#27272a]">
                           <span className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">{Number(selectedRow.maxStock || 0) > 0 ? Number(selectedRow.maxStock).toLocaleString() : "-"}</span>
                           <span className="text-[10px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase mt-1">Max</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center border-l border-[#e5e7eb] dark:border-[#27272a]">
                           <span className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">{getStockPercent(selectedRow) !== null ? `${getStockPercent(selectedRow)}%` : "-"}</span>
                           <span className="text-[10px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase mt-1">Stock %</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-between">
                       <div>
                         <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Status</p>
                         {(() => {
                            const s = getStockStatus(selectedRow)
                            const bClass = s === "OUT" ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20" 
                                        : s === "LOW" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                                        : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
                            return (
                               <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${bClass}`}>
                                  {s !== "OK" && <FaTriangleExclamation />}
                                  {s === "OUT" ? "OUT OF STOCK" : s}
                               </span>
                            )
                         })()}
                       </div>
                       {selectedRow.updatedAt && (
                          <div className="text-right">
                             <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Last Movement</p>
                             <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">
                               {new Date(selectedRow.updatedAt).toLocaleDateString()} {new Date(selectedRow.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </p>
                          </div>
                       )}
                    </div>
                  </div>
              )}
            </div>
            
            <div className="p-4 border-t border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-[#64748b] dark:text-[#a1a1aa] flex-1 text-left">
                 {!showHistory && "Stock adjustment is handled by shop admins."}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => { setSelectedRow(null); setShowHistory(false); }}
                    className="h-10 px-4 bg-white dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] text-[#020617] dark:text-[#f8fafc] text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Close
                  </button>

                  {!showHistory ? (
                      <button
                        type="button"
                        onClick={() => loadHistory(selectedRow)}
                        className="h-10 px-4 bg-white dark:bg-[#111113] border border-[#7033ff] text-[#7033ff] text-sm font-semibold rounded-lg hover:bg-[#7033ff]/5 transition-colors shadow-sm"
                      >
                        Stock History
                      </button>
                  ) : (
                      <button
                        type="button"
                        onClick={() => setShowHistory(false)}
                        className="h-10 px-4 bg-white dark:bg-[#111113] border border-[#7033ff] text-[#7033ff] text-sm font-semibold rounded-lg hover:bg-[#7033ff]/5 transition-colors shadow-sm"
                      >
                        Back to Details
                      </button>
                  )}

                  <button
                    type="button"
                    className="h-10 px-4 bg-[#7033ff]/50 text-white text-sm font-semibold rounded-lg transition-colors opacity-50 cursor-not-allowed"
                    disabled
                    title="Stock adjustment is handled by shop admins from Admin Inventory."
                  >
                    Admin Only
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Stock
