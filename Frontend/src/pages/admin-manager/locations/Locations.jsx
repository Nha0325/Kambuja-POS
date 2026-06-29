import { useState, useEffect, useCallback } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { 
  FaMapLocationDot, 
  FaCity, 
  FaBuilding, 
  FaStore,
} from "react-icons/fa6"
import { adminManagerService } from "../../../services/users/adminManager.service"
import { 
  cardClass, 
  inputClass, 
  selectClass, 
  tableHeadClass, 
  tableHeadCellClass, 
  tableCellClass 
} from "../adminManagerUi"
import { PageHeader, TableEmpty, StatusBadge } from "../../../components/admin/AdminManagerUi"

function Locations() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [provinceFilter] = useState("ALL")
  const [locations, setLocations] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")
      const [locRes, sumRes] = await Promise.all([
        adminManagerService.getLocations(),
        adminManagerService.getLocationsSummary()
      ])
      setLocations(locRes.data?.result || [])
      setSummary(sumRes.data?.result || null)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Something went wrong loading locations")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredLocations = locations
    .filter((loc) => statusFilter === "ALL" || loc.status === statusFilter)
    .filter((loc) => provinceFilter === "ALL" || loc.province === provinceFilter)
    .filter((loc) => {
      if (!search) return true
      const s = search.toLowerCase()
      const managerName = loc.manager?.username || ""
      return (
        loc.name?.toLowerCase().includes(s) ||
        loc.code?.toLowerCase().includes(s) ||
        loc.province?.toLowerCase().includes(s) || 
        loc.district?.toLowerCase().includes(s) ||
        managerName.toLowerCase().includes(s)
      )
    })

  return (
    <div className="w-full max-w-none min-w-0 flex flex-col gap-6">
      <PageHeader 
        title="Locations Summary" 
        description="View main shop locations and regional distribution."
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardClass} p-5 flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4]">
              <FaMapLocationDot className="text-xl" />
            </div>
            <p className="text-sm font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Total Locations</p>
          </div>
          <h3 className="text-3xl font-bold text-[#020617] dark:text-[#f8fafc]">{summary?.total || 0}</h3>
        </div>

        <div className={`${cardClass} p-5 flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-orange-500">
              <FaCity className="text-xl" />
            </div>
            <p className="text-sm font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Total Provinces</p>
          </div>
          <h3 className="text-3xl font-bold text-[#020617] dark:text-[#f8fafc]">{summary?.provinces || 0}</h3>
        </div>

        <div className={`${cardClass} p-5 flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-500">
              <FaBuilding className="text-xl" />
            </div>
            <p className="text-sm font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Total Districts</p>
          </div>
          <h3 className="text-3xl font-bold text-[#020617] dark:text-[#f8fafc]">{summary?.districts || 0}</h3>
        </div>

        <div className={`${cardClass} p-5 flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4]">
              <FaStore className="text-xl" />
            </div>
            <p className="text-sm font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Mapped Shops</p>
          </div>
          <h3 className="text-3xl font-bold text-[#020617] dark:text-[#f8fafc]">{summary?.mappedShops || 0}</h3>
        </div>
      </div>

      {/* Table Card */}
      <div className={`${cardClass} overflow-hidden flex flex-col`}>
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] dark:border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-[280px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#64748b] dark:text-[#a1a1aa]">search</span>
              <input 
                className={`${inputClass} pl-10`}
                placeholder="Search shops..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="relative min-w-[140px]">
              <select 
                className={selectClass}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="LOCKED">Locked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px] table-auto text-left border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Name & Code</th>
                <th className={tableHeadCellClass}>Type</th>
                <th className={tableHeadCellClass}>Shop</th>
                <th className={tableHeadCellClass}>Manager</th>
                <th className={tableHeadCellClass}>Location/Area</th>
                <th className={`${tableHeadCellClass} text-center`}>Allow POS</th>
                <th className={`${tableHeadCellClass} text-center`}>Status</th>
                <th className={`${tableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {isLoading ? (
                <TableEmpty colSpan="8">Loading shops...</TableEmpty>
              ) : filteredLocations.length === 0 ? (
                <TableEmpty colSpan="8">No shops found. Create a shop first.</TableEmpty>
              ) : (
                filteredLocations.map((loc) => {
                  const managerName = loc.manager?.username || "Unknown"
                  const locationArea = [loc.province, loc.district].filter(Boolean).join(" - ") || loc.addressDetail || "-"

                  return (
                    <tr key={loc._id} className="hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors group">
                      <td className={tableCellClass}>
                        <div className="font-bold text-[#020617] dark:text-[#f8fafc]">{loc.name}</div>
                        {loc.code && <div className="text-xs text-[#06b6d4] font-mono mt-0.5">{loc.code}</div>}
                      </td>
                      <td className={tableCellClass}>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#f8fafc] dark:bg-[#09090b] border border-[#e5e7eb] dark:border-[#27272a] text-[#64748b] dark:text-[#a1a1aa]">
                          {loc.type || "Branch"}
                        </span>
                      </td>
                      <td className={tableCellClass}>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#64748b] dark:text-[#a1a1aa]">storefront</span>
                          <span className="text-sm font-medium">{loc.shop?.name || "-"}</span>
                        </div>
                      </td>
                      <td className={tableCellClass}>
                        <div className="text-sm">
                          <p className="font-semibold">{managerName}</p>
                          {(loc.manager?.email || loc.manager?.phone || loc.phone) && (
                            <p className="text-xs text-[#64748b] dark:text-[#a1a1aa] mt-0.5">{loc.manager?.phone || loc.phone || loc.manager?.email}</p>
                          )}
                        </div>
                      </td>
                      <td className={tableCellClass}>
                        <div className="text-sm font-medium">
                          {locationArea}
                        </div>
                      </td>
                      <td className={`${tableCellClass} text-center`}>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${loc.posAccess ? 'bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/20' : 'bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a]'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${loc.posAccess ? 'bg-[#06b6d4]' : 'bg-[#64748b] dark:bg-[#a1a1aa]'}`}></span>
                          {loc.posAccess ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className={`${tableCellClass} text-center`}>
                        <StatusBadge status={loc.status} />
                      </td>
                      <td className={`${tableCellClass} text-right`}>
                        <div className="flex items-center justify-end gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Link 
                            to={`/admin-manager/shops`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 dark:hover:bg-[#06b6d4]/20 transition-colors" 
                            title="View Shop in Directory"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Locations

