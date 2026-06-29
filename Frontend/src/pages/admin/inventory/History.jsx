import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { adminService } from "../../../services/users/admin.service"
import {
  LuSearch,
  LuChevronLeft,
  LuChevronRight,
  LuArrowDownToLine,
  LuArrowUpFromLine,
  LuSlidersHorizontal
} from "react-icons/lu"
import dayjs from "dayjs"
import { adminSurface } from "../adminPageUi"
import { getImageUrl } from "../../../utils/helpers/getImageUrl"
import { useTranslation } from "react-i18next";

function History() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    adminService.inventoryMovements()
      .then((response) => setRows(response.data.result || []))
  }, [])

  // Filtering
  const filteredRows = rows.filter(row => {
    const typeAliases = {
      RECEIVE_STOCK: ["RECEIVE_STOCK", "STOCK_IN"],
      STOCK_ADJUSTMENT: ["STOCK_ADJUSTMENT", "ADJUSTMENT", "ADJUSTMENT_INCREASE", "ADJUSTMENT_DECREASE", "ADJUSTMENT_SET"],
    }
    const matchesSearch = row.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
                          row.product?.code?.toLowerCase().includes(search.toLowerCase()) ||
                          row.reason?.toLowerCase().includes(search.toLowerCase()) ||
                          row.note?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter ? (typeAliases[typeFilter] || [typeFilter]).includes(row.type) : true

    return matchesSearch && matchesType
  })

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage))
  const paginatedRows = filteredRows.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const getTypeBadge = (type) => {
    switch (type) {
      case "RECEIVE_STOCK":
      case "STOCK_IN":
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-2.5 py-1 text-xs font-semibold text-[#22C55E]"><LuArrowDownToLine size={12}/> {t('receive_stock')}</span>
      case "SALE":
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EF4444]/20 bg-[#EF4444]/10 px-2.5 py-1 text-xs font-semibold text-[#EF4444]"><LuArrowDownToLine size={12}/> {t('sale')}</span>
      case "STOCK_ADJUSTMENT":
      case "ADJUSTMENT":
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2.5 py-1 text-xs font-semibold text-[#F59E0B]"><LuSlidersHorizontal size={12}/> {t('stock_adjustment')}</span>
      case "RETURN":
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/10 px-2.5 py-1 text-xs font-semibold text-[#3B82F6]"><LuArrowUpFromLine size={12}/> {t('return')}</span>
      case "CANCEL_SALE":
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6B7280]/20 bg-[#6B7280]/10 px-2.5 py-1 text-xs font-semibold text-[#6B7280]">{t('cancel_sale')}</span>
      default:
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6B7280]/20 bg-[#6B7280]/10 px-2.5 py-1 text-xs font-semibold text-[#6B7280]">{type}</span>
    }
  }

  return (
    <section className={adminSurface.page}>
      <nav className="mb-2 flex items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
        <Link to="/admin/inventory" className="hover:text-[#06b6d4]">{t('inventory')}</Link>
        <span className="text-[#64748b] dark:text-[#a1a1aa]">&gt;</span>
        <span className="font-semibold text-[#020617] dark:text-[#f8fafc]">{t('movement_history')}</span>
      </nav>
      {/* Header */}
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>{t('inventory')}</p>
          <h1 className={adminSurface.title}>{t('movement_history')}</h1>
          <p className={adminSurface.description}>
            {t('movement_history_desc')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Link to="/admin/inventory" className={adminSurface.secondaryButton}>
             {t('overview')}
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <div className={adminSurface.tableShell}>
        {/* Filters */}
        <div className={`${adminSurface.toolbar} grid grid-cols-1 sm:grid-cols-2 gap-4`}>
          <div className="relative w-full sm:col-span-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LuSearch className="h-5 w-5 text-[#6B7280]" />
            </div>
            <input
              placeholder={t('search_product_code_reason')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className={`${adminSurface.input} pl-10 w-full`}
            />
          </div>
          <div className="relative w-full">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className={`${adminSurface.select} w-full`}
            >
              <option value="">{t('all_types')}</option>
              <option value="RECEIVE_STOCK">{t('receive_stock')}</option>
              <option value="SALE">{t('sale')}</option>
              <option value="STOCK_ADJUSTMENT">{t('stock_adjustment')}</option>
              <option value="RETURN">{t('return')}</option>
              <option value="CANCEL_SALE">{t('cancel_sale')}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className={adminSurface.tableWrap}>
          <table className={`${adminSurface.table} min-w-[1000px]`}>
            <thead className={adminSurface.tableHead}>
              <tr>
                <th className={adminSurface.th}>{t('date')}</th>
                <th className={adminSurface.th}>{t('product')}</th>
                <th className={adminSurface.th}>{t('type')}</th>
                <th className={`${adminSurface.th} text-right`}>{t('before')}</th>
                <th className={`${adminSurface.th} text-right`}>{t('change')}</th>
                <th className={`${adminSurface.th} text-right`}>{t('after')}</th>
                <th className={adminSurface.th}>{t('reason_note')}</th>
                <th className={adminSurface.th}>{t('reference')}</th>
                <th className={adminSurface.th}>{t('by')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => {
                const beforeQty = row.beforeQty ?? row.quantityBefore ?? 0
                const qtyChange = row.qtyChange ?? row.quantity ?? 0
                const afterQty = row.afterQty ?? row.quantityAfter ?? 0
                const reference = row.invoiceNo || row.referenceType || row.referenceId || "-"

                return (
                  <tr key={row._id} className={adminSurface.row}>
                    <td className={`${adminSurface.td} whitespace-nowrap text-[#6B7280]`}>
                      {dayjs(row.createdAt).format("DD MMM, YYYY HH:mm")}
                    </td>
                    <td className={adminSurface.td}>
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(row.product?.imageUrl || row.product?.image || row.product?.productImage)}
                          alt={row.product?.name || "Product"}
                          className="h-8 w-8 rounded-lg border border-[#2A2E36] object-cover bg-slate-100"
                          onError={(e) => { e.currentTarget.src = "/placeholder-product.svg"; }}
                        />
                        <div>
                          <span className="font-semibold block text-[#F8FAFC]">{row.product?.name || "-"}</span>
                          <span className="text-xs text-[#6B7280]">{row.product?.code || row.product?.sku || "-"}</span>
                        </div>
                      </div>
                    </td>
                    <td className={adminSurface.td}>
                      {getTypeBadge(row.type)}
                    </td>
                    <td className={`${adminSurface.td} text-right text-[#A9A6BB]`}>{beforeQty}</td>
                    <td className={`${adminSurface.td} text-right font-bold ${
                      qtyChange > 0 ? 'text-emerald-400' : qtyChange < 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {qtyChange > 0 ? '+' : ''}{qtyChange}
                    </td>
                    <td className={`${adminSurface.td} text-right font-bold text-[#F8FAFC]`}>{afterQty}</td>
                    <td className={adminSurface.td}>
                      <div className="max-w-[220px] truncate">
                        <span className="block text-sm text-[#F8FAFC]">{row.reason || "-"}</span>
                        {row.note && <span className="block text-xs text-[#6B7280] truncate">{row.note}</span>}
                      </div>
                    </td>
                    <td className={`${adminSurface.td} text-sm text-[#6B7280]`}>
                      {reference}
                    </td>
                    <td className={`${adminSurface.td} text-sm text-[#6B7280]`}>
                      {row.createdBy?.name || row.createdBy?.username || row.user?.name || row.user?.username || "-"}
                    </td>
                  </tr>
                )
              })}
              {paginatedRows.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-[#6B7280]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <LuSearch size={32} className="text-[#6B7280] opacity-50" />
                      <p>{t('no_movement_history')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={adminSurface.footer}>
          <p className="text-sm text-[#A9A6BB]">
            Showing <span className="font-semibold text-[#F8FAFC]">{filteredRows.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold text-[#F8FAFC]">{Math.min(page * itemsPerPage, filteredRows.length)}</span> of <span className="font-semibold text-[#F8FAFC]">{filteredRows.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className={adminSurface.paginationButton}
            >
              <LuChevronLeft size={16} />
            </button>
            <span className={adminSurface.paginationCurrent}>{page}</span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className={adminSurface.paginationButton}
            >
              <LuChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default History
