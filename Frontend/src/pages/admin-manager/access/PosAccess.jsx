import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { FaCashRegister, FaCircleInfo, FaStore, FaUserShield } from "react-icons/fa6"
import { adminManagerService } from "../../../services/users/adminManager.service"
import { formatApiError } from "../../../utils/formatters/formatApiError"
import {
  cardClass,
  primaryButtonClass,
  secondaryButtonClass,
  tableCellClass,
  tableHeadCellClass,
  tableHeadClass,
} from "../adminManagerUi"
import { PageHeader, StatusBadge, TableEmpty } from "../../../components/admin/AdminManagerUi"
import { useTranslation } from "react-i18next"

function PosAccess() {
  const { t } = useTranslation()
  const [shops, setShops] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadShops = useCallback(() => {
    setIsLoading(true)
    setError("")
    return adminManagerService.getShops()
      .then((response) => setShops(response.data.result || []))
      .catch((loadError) => {
        if (loadError?.response?.status !== 401) {
          setError(formatApiError(loadError) || t('unable_to_load_shops'))
        }
      })
      .finally(() => setIsLoading(false))
  }, [t])

  useEffect(() => {
    loadShops()
  }, [loadShops])

  const activeShops = useMemo(() => shops.filter((shop) => shop.status === "ACTIVE"), [shops])
  const assignedShops = useMemo(() => shops.filter((shop) => shop.ownerAdminId), [shops])

  return (
    <section>
      <PageHeader
        title={t('pos')}
        description={t('pos_access_desc')}
        action={(
          <Link className={primaryButtonClass} to="/admin-manager/admin-owners/create">
            <FaUserShield />
            {t('create_admin_owner')}
          </Link>
        )}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa]">{t('total_shops')}</p>
          <strong className="block text-2xl font-bold text-[#020617] dark:text-[#f8fafc]">{shops.length.toLocaleString()}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa]">{t('active_shops')}</p>
          <strong className="block text-2xl font-bold text-[#020617] dark:text-[#f8fafc]">{activeShops.length.toLocaleString()}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa]">{t('assigned_admin_owners')}</p>
          <strong className="block text-2xl font-bold text-[#020617] dark:text-[#f8fafc]">{assignedShops.length.toLocaleString()}</strong>
        </article>
      </div>

      <div className="mb-6 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white dark:bg-[#09090b] p-3 text-[#06b6d4]">
            <FaCircleInfo />
          </div>
          <div>
            <h2 className="font-semibold text-[#020617] dark:text-[#f8fafc]">{t('why_not_cashier_pos')}</h2>
            <p className="mt-1 text-sm leading-6 text-[#64748b] dark:text-[#a1a1aa]">
              {t('why_not_cashier_pos_desc')}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className={secondaryButtonClass} to="/admin-manager/shops">
                <FaStore />
                {t('manage_shops')}
              </Link>
              <Link className={secondaryButtonClass} to="/admin-manager/admin-owners">
                <FaUserShield />
                {t('manage_admin_owners')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden flex flex-col`}>
        <div className="border-b border-[#e5e7eb] dark:border-[#27272a] px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[#020617] dark:text-[#f8fafc]">
            <FaCashRegister />
            {t('pos_readiness')}
          </h3>
          <p className="mt-1 text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('pos_readiness_desc')}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>{t('shop')}</th>
                <th className={tableHeadCellClass}>{t('code')}</th>
                <th className={tableHeadCellClass}>{t('admin_owner')}</th>
                <th className={tableHeadCellClass}>{t('status')}</th>
                <th className={tableHeadCellClass}>{t('ready')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {isLoading ? (
                <TableEmpty colSpan="5">{t('loading_shops')}</TableEmpty>
              ) : shops.map((shop) => {
                const ready = shop.status === "ACTIVE" && Boolean(shop.ownerAdminId)

                return (
                  <tr key={shop._id} className="transition-colors hover:bg-[#f8fafc] dark:hover:bg-[#09090b]">
                    <td className={`${tableCellClass} font-semibold text-[#020617] dark:text-[#f8fafc]`}>{shop.name || "-"}</td>
                    <td className={tableCellClass}>{shop.code || "-"}</td>
                    <td className={tableCellClass}>{shop.ownerAdminId?.username || "-"}</td>
                    <td className={tableCellClass}><StatusBadge status={shop.status} /></td>
                    <td className={tableCellClass}>
                      <span className={ready ? "font-semibold text-emerald-600 dark:text-emerald-400" : "font-semibold text-amber-600 dark:text-amber-400"}>
                        {ready ? t('ready') : t('needs_setup')}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {!isLoading && shops.length === 0 && <TableEmpty colSpan="5">{t('no_shops_found')}</TableEmpty>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default PosAccess
