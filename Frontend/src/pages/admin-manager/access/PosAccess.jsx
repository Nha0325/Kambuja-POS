import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { FaCashRegister, FaCircleInfo, FaStore, FaUserShield } from "react-icons/fa6"
import { adminManagerService } from "../../../services/adminManager.service"
import { formatApiError } from "../../../utils/formatApiError"
import {
  cardClass,
  primaryButtonClass,
  secondaryButtonClass,
  tableCellClass,
  tableHeadCellClass,
  tableHeadClass,
} from "../adminManagerUi"
import { PageHeader, StatusBadge, TableEmpty } from "../components/AdminManagerUi"

function PosAccess() {
  const [shops, setShops] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadShops = useCallback(() => {
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
    loadShops()
  }, [loadShops])

  const activeShops = useMemo(() => shops.filter((shop) => shop.status === "ACTIVE"), [shops])
  const assignedShops = useMemo(() => shops.filter((shop) => shop.ownerAdminId), [shops])

  return (
    <section>
      <PageHeader
        title="POS"
        description="POS is shop-scoped. Platform managers can review shop readiness and create shop users from here."
        action={(
          <Link className={primaryButtonClass} to="/admin-manager/admins/create">
            <FaUserShield />
            Create Shop Admin
          </Link>
        )}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Total Shops</p>
          <strong className="block text-2xl font-bold text-slate-900">{shops.length.toLocaleString()}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Active Shops</p>
          <strong className="block text-2xl font-bold text-slate-900">{activeShops.length.toLocaleString()}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Assigned Admins</p>
          <strong className="block text-2xl font-bold text-slate-900">{assignedShops.length.toLocaleString()}</strong>
        </article>
      </div>

      <div className="mb-6 rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-3 text-violet-700">
            <FaCircleInfo />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Why this is not the cashier POS screen</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Cashier POS creates sales under one shop. An ADMIN_MANAGER account is platform-wide, so it must create or assign a shop ADMIN/CASHIER account before that user opens the business POS.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className={secondaryButtonClass} to="/admin-manager/shops">
                <FaStore />
                Manage Shops
              </Link>
              <Link className={secondaryButtonClass} to="/admin-manager/admins">
                <FaUserShield />
                Manage Users
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="border-b border-violet-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <FaCashRegister />
            POS Readiness
          </h3>
          <p className="mt-1 text-sm text-slate-500">Active shops with assigned admins are ready for shop users to run POS.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Shop</th>
                <th className={tableHeadCellClass}>Code</th>
                <th className={tableHeadCellClass}>Owner Admin</th>
                <th className={tableHeadCellClass}>Status</th>
                <th className={tableHeadCellClass}>Ready</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100">
              {isLoading ? (
                <TableEmpty colSpan="5">Loading shops...</TableEmpty>
              ) : shops.map((shop) => {
                const ready = shop.status === "ACTIVE" && Boolean(shop.ownerAdminId)

                return (
                  <tr key={shop._id} className="transition-colors hover:bg-violet-50/50">
                    <td className={`${tableCellClass} font-semibold text-slate-900`}>{shop.name || "-"}</td>
                    <td className={tableCellClass}>{shop.code || "-"}</td>
                    <td className={tableCellClass}>{shop.ownerAdminId?.username || "-"}</td>
                    <td className={tableCellClass}><StatusBadge status={shop.status} /></td>
                    <td className={tableCellClass}>
                      <span className={ready ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
                        {ready ? "Ready" : "Needs setup"}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {!isLoading && shops.length === 0 && <TableEmpty colSpan="5">No shops found</TableEmpty>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default PosAccess
