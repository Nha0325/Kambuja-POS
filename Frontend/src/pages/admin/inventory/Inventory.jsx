import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { adminService } from "../../../services/admin.service"
import {
  LuSearch,
  LuPackage,
  LuTriangleAlert,
  LuCircleX,
  LuBoxes,
  LuPackagePlus,
  LuSlidersHorizontal,
  LuChevronLeft,
  LuChevronRight,
  LuFilter
} from "react-icons/lu"
import dayjs from "dayjs"
import { adminSurface } from "../adminPageUi"

function Inventory() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    adminService.inventory()
      .then((response) => setRows(response.data.result || []))
  }, [])

  // Derived metrics
  const totalProducts = rows.length
  const totalStockUnits = rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
  const lowStockCount = rows.filter((row) => Number(row.quantity || 0) > 0 && Number(row.quantity || 0) <= Number(row.reorderLevel || 0)).length
  const outOfStockCount = rows.filter((row) => Number(row.quantity || 0) === 0).length

  // Unique categories for filter
  const categories = [...new Set(rows.map(row => row.product?.category?.name).filter(Boolean))]

  // Filtering
  const filteredRows = rows.filter(row => {
    const qty = Number(row.quantity || 0)
    const min = Number(row.reorderLevel || 0)
    const status = qty === 0 ? "out_of_stock" : (qty <= min ? "low_stock" : "in_stock")

    const matchesSearch = row.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
                          row.product?.code?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter ? row.product?.category?.name === categoryFilter : true
    const matchesStatus = statusFilter ? status === statusFilter : true

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage))
  const paginatedRows = filteredRows.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const getStatusBadge = (qty, min) => {
    if (qty === 0) return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EF4444]/20 bg-[#EF4444]/10 px-2.5 py-1 text-xs font-semibold text-[#EF4444]"><span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>Out of Stock</span>
    if (qty <= min) return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2.5 py-1 text-xs font-semibold text-[#F59E0B]"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>Low Stock</span>
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-2.5 py-1 text-xs font-semibold text-[#22C55E]"><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>In Stock</span>
  }

  return (
    <section className={adminSurface.page}>
      {/* Header */}
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>Inventory</p>
          <h1 className={adminSurface.title}>Stock Overview</h1>
          <p className={adminSurface.description}>
            Manage your inventory, monitor stock levels, and track product availability.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Link to="/admin/inventory/adjustment" className={adminSurface.secondaryButton}>
            <LuSlidersHorizontal size={18} /> Adjust
          </Link>
          <Link to="/admin/inventory/stock-in" className={adminSurface.primaryButton}>
            <LuPackagePlus size={18} /> Stock In
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={adminSurface.statGrid}>
        <div className={adminSurface.statCard}>
          <div className="flex items-center justify-between">
            <p className={adminSurface.statLabel}>Total Products</p>
            <div className={adminSurface.statIcon}>
              <LuPackage size={20} />
            </div>
          </div>
          <p className={adminSurface.statValue}>{totalProducts}</p>
        </div>

        <div className={adminSurface.statCard}>
          <div className="flex items-center justify-between">
            <p className={adminSurface.statLabel}>Total Stock Units</p>
            <div className={`${adminSurface.statIcon} text-[#22C55E] bg-[#22C55E]/10`}>
              <LuBoxes size={20} />
            </div>
          </div>
          <p className={adminSurface.statValue}>{totalStockUnits}</p>
        </div>

        <div className={adminSurface.statCard}>
          <div className="flex items-center justify-between">
            <p className={adminSurface.statLabel}>Low Stock Products</p>
            <div className={`${adminSurface.statIcon} text-[#F59E0B] bg-[#F59E0B]/10`}>
              <LuTriangleAlert size={20} />
            </div>
          </div>
          <p className={adminSurface.statValue}>{lowStockCount}</p>
        </div>

        <div className={adminSurface.statCard}>
          <div className="flex items-center justify-between">
            <p className={adminSurface.statLabel}>Out of Stock</p>
            <div className={`${adminSurface.statIcon} text-[#EF4444] bg-[#EF4444]/10`}>
              <LuCircleX size={20} />
            </div>
          </div>
          <p className={adminSurface.statValue}>{outOfStockCount}</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className={adminSurface.tableShell}>
        {/* Filters */}
        <div className={`${adminSurface.toolbar} grid grid-cols-1 sm:grid-cols-3 gap-4`}>
          <div className="relative w-full sm:col-span-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LuSearch className="h-5 w-5 text-[#6B7280]" />
            </div>
            <input
              placeholder="Search product or SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className={`${adminSurface.input} pl-10 w-full`}
            />
          </div>
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10">
              <LuFilter className="h-4 w-4 text-[#6B7280]" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className={`${adminSurface.select} pl-9 w-full`}
            >
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={`${adminSurface.select} w-full`}
          >
            <option value="">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Table */}
        <div className={adminSurface.tableWrap}>
          <table className={`${adminSurface.table} min-w-[1000px]`}>
            <thead className={adminSurface.tableHead}>
              <tr>
                <th className={adminSurface.th}>Product</th>
                <th className={adminSurface.th}>SKU / Barcode</th>
                <th className={adminSurface.th}>Category</th>
                <th className={adminSurface.th}>Supplier</th>
                <th className={`${adminSurface.th} text-right`}>Current Stock</th>
                <th className={`${adminSurface.th} text-right`}>Min Stock</th>
                <th className={`${adminSurface.th} text-center`}>Status</th>
                <th className={`${adminSurface.th} text-right`}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => {
                const qty = Number(row.quantity || 0)
                const min = Number(row.reorderLevel || 0)
                return (
                  <tr key={row._id} className={adminSurface.row}>
                    <td className={adminSurface.td}>
                      <div className="flex items-center gap-3">
                        {row.product?.imageUrl ? (
                          <img src={row.product.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover border border-[#2A2E36]" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#111318] text-[#22D3EE] border border-[#2A2E36]">
                            <LuPackage size={20} />
                          </div>
                        )}
                        <span className="font-semibold text-[#F8FAFC]">{row.product?.name || "-"}</span>
                      </div>
                    </td>
                    <td className={`${adminSurface.td} font-medium text-[#A9A6BB]`}>{row.product?.code || "-"}</td>
                    <td className={`${adminSurface.td} text-[#6B7280]`}>{row.product?.category?.name || "-"}</td>
                    <td className={`${adminSurface.td} text-[#6B7280]`}>
                      {row.product?.supplier?.businessName || row.product?.supplier?.name || row.supplier?.businessName || row.supplier?.name || "-"}
                    </td>
                    <td className={`${adminSurface.td} text-right font-bold text-[#F8FAFC]`}>{qty}</td>
                    <td className={`${adminSurface.td} text-right text-[#A9A6BB]`}>{min}</td>
                    <td className={`${adminSurface.td} text-center`}>
                      {getStatusBadge(qty, min)}
                    </td>
                    <td className={`${adminSurface.td} text-right text-[#6B7280]`}>
                      {dayjs(row.updatedAt).format("DD MMM, YYYY")}
                    </td>
                  </tr>
                )
              })}
              {paginatedRows.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-[#6B7280]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <LuSearch size={32} className="text-[#6B7280] opacity-50" />
                      <p>No inventory matching your filters.</p>
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

export default Inventory
