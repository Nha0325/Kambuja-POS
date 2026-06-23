import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { FaBuilding, FaDownload, FaFilter, FaLocationDot, FaMagnifyingGlass, FaPlus, FaUserShield } from "react-icons/fa6"
import { adminManagerService } from "../../../services/adminManager.service"
import { getAddressSummary } from "../../../data/cambodiaAddress"
import { downloadCsv } from "../../../utils/downloadCsv"
import { formatApiError } from "../../../utils/formatApiError"
import {
  cardClass,
  getInitials,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  tableCellClass,
  tableHeadCellClass,
  tableHeadClass,
} from "../adminManagerUi"
import { PageHeader, StatusBadge, TableEmpty } from "../components/AdminManagerUi"

const getShopLocation = (shop) => {
  if (shop.address && typeof shop.address === "object") return getAddressSummary(shop.address) || "-"
  return [shop.districtName || shop.city, shop.provinceName || shop.province].filter(Boolean).join(", ") || "-"
}

function Shops() {
  const [shops, setShops] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const load = useCallback(() => {
    setIsLoading(true)
    setError("")
    return adminManagerService.shops()
      .then((response) => setShops(response.data.result || []))
      .catch((loadError) => {
        if (loadError?.response?.status !== 401) {
          setError(formatApiError(loadError) || "Unable to load shops")
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const displayedShops = useMemo(() => {
    const term = search.trim().toLowerCase()
    return shops.filter((shop) => (
      (statusFilter === "ALL" || shop.status === statusFilter)
      && (!term
        || shop.name?.toLowerCase().includes(term)
        || shop.code?.toLowerCase().includes(term)
        || shop.ownerAdminId?.username?.toLowerCase().includes(term)
        || getShopLocation(shop).toLowerCase().includes(term))
    ))
  }, [shops, search, statusFilter])

  const exportShops = () => {
    downloadCsv(
      "admin-manager-shops.csv",
      [
        { label: "Name", value: (shop) => shop.name || "" },
        { label: "Code", value: (shop) => shop.code || "" },
        { label: "Owner Admin", value: (shop) => shop.ownerAdminId?.username || "" },
        { label: "Location", value: (shop) => getShopLocation(shop) },
        { label: "Status", value: (shop) => shop.status || "" },
      ],
      displayedShops
    )
  }

  const remove = async (id) => {
    if (!window.confirm("Delete this shop?")) return
    try {
      await adminManagerService.deleteShop(id)
      toast.success("Shop deleted")
      load()
    } catch (error) {
      if (error?.response?.status === 401) return
      toast.error(error.response?.data?.error || "Unable to delete shop")
    }
  }

  const updateStatus = async (shop) => {
    const nextStatus = shop.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      await adminManagerService.updateShopStatus(shop._id, nextStatus)
      toast.success(`Shop ${nextStatus.toLowerCase()}`)
      load()
    } catch (error) {
      if (error?.response?.status === 401) return
      toast.error(error.response?.data?.error || "Unable to update shop status")
    }
  }

  const activeCount = shops.filter((shop) => shop.status === "ACTIVE").length
  const inactiveCount = shops.filter((shop) => shop.status === "INACTIVE").length

  return (
    <section>
      <PageHeader
        title="Shops"
        description="Manage and monitor all commercial outlets on the platform."
        action={(
          <Link className={primaryButtonClass} to="/admin-manager/shops/create">
            <FaPlus />
            Add Shop
          </Link>
        )}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Total Shops</p>
          <strong className="block text-3xl font-bold text-slate-900">{shops.length.toLocaleString()}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Active Now</p>
          <strong className="block text-3xl font-bold text-slate-900">{activeCount.toLocaleString()}</strong>
        </article>
        <article className="relative overflow-hidden rounded-2xl border border-violet-700 bg-violet-700 p-5 text-white shadow-sm shadow-violet-200 lg:col-span-2">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-violet-100">Platform Status</p>
          <h2 className="text-xl font-semibold">{displayedShops.length.toLocaleString()} shops displayed</h2>
          <p className="mt-1 max-w-md text-sm leading-6 text-violet-100">
            Active {activeCount.toLocaleString()} • Inactive {inactiveCount.toLocaleString()}
          </p>
        </article>
      </div>

      <div className="rounded-t-2xl border border-violet-100 bg-violet-50/70 px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <label className="relative max-w-md flex-1">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className={`${inputClass} pl-10`}
              placeholder="Search by name, code, owner, or location..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-3 md:ml-auto">
            <label className={secondaryButtonClass}>
              <FaFilter />
              <select
                className="bg-transparent text-sm font-semibold outline-none"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
            <button className={secondaryButtonClass} type="button" onClick={exportShops} disabled={displayedShops.length === 0}>
              <FaDownload />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-b-2xl border-x border-b border-violet-100 bg-white shadow-sm shadow-violet-100/50">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Name</th>
                <th className={tableHeadCellClass}>Code</th>
                <th className={tableHeadCellClass}>Owner Admin</th>
                <th className={tableHeadCellClass}>Location</th>
                <th className={tableHeadCellClass}>Status</th>
                <th className={`${tableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100">
              {isLoading ? (
                <TableEmpty colSpan="6">Loading shops...</TableEmpty>
              ) : displayedShops.map((shop) => (
                <tr key={shop._id} className="group transition-colors hover:bg-violet-50/50">
                  <td className={tableCellClass}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-bold text-violet-800 transition-transform group-hover:scale-105">
                        {getInitials(shop.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{shop.name}</p>
                        <p className="text-xs text-slate-500">Retail Hub</p>
                      </div>
                    </div>
                  </td>
                  <td className={tableCellClass}>
                    <span className="rounded-lg border border-violet-100 bg-violet-50 px-2 py-1 text-xs font-mono text-violet-800">{shop.code || "-"}</span>
                  </td>
                  <td className={tableCellClass}>
                    <div className="flex items-center gap-2">
                      <FaUserShield className="text-slate-500" />
                      <span>{shop.ownerAdminId?.username || "-"}</span>
                    </div>
                  </td>
                  <td className={tableCellClass}>
                    <div className="flex items-center gap-2">
                      <FaLocationDot className="text-red-600" />
                      <span>{getShopLocation(shop)}</span>
                    </div>
                  </td>
                  <td className={tableCellClass}><StatusBadge status={shop.status} /></td>
                  <td className={`${tableCellClass} text-right`}>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link className={secondaryButtonClass} to={`/admin-manager/shops/${shop._id}/edit`}>Edit</Link>
                      <button className={secondaryButtonClass} type="button" onClick={() => updateStatus(shop)}>
                        {shop.status === "ACTIVE" ? "Disable" : "Enable"}
                      </button>
                      <button className="inline-flex h-11 items-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100" type="button" onClick={() => remove(shop._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && displayedShops.length === 0 && <TableEmpty colSpan="6">No shops found</TableEmpty>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-6">
        <FaBuilding className="mt-1 text-2xl text-violet-700" />
        <div>
          <h3 className="text-base font-semibold text-slate-900">Administrative Guidelines</h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Active status allows a shop to operate. Disabling a shop keeps the record visible for administrators.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Shops
