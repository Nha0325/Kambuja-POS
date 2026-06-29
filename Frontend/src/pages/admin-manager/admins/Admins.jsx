import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { adminManagerService } from "../../../services/users/adminManager.service"
import { formatApiError } from "../../../utils/formatters/formatApiError"
import formatDate from "../../../utils/formatters/formatDate"

import { 
  cardClass, 
  inputClass, 
  selectClass, 
  primaryButtonClass,
  tableHeadClass, 
  tableHeadCellClass, 
  tableCellClass 
} from "../adminManagerUi"
import { PageHeader, TableEmpty, StatusBadge } from "../../../components/admin/AdminManagerUi"
import { useTranslation } from "react-i18next"


function Admins() {
  const [admins, setAdmins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [assignmentFilter, setAssignmentFilter] = useState("ALL")
  const { t } = useTranslation()

  const load = useCallback(() => {
    setIsLoading(true)
    setError("")
    return adminManagerService.getAdmins()
      .then((response) => setAdmins(response.data.result || []))
      .catch((loadError) => {
        if (loadError?.response?.status !== 401) {
          setError(formatApiError(loadError) || t('unable_to_load_admin_accounts'))
        }
      })
      .finally(() => setIsLoading(false))
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const displayedAdmins = useMemo(() => {
    const term = search.trim().toLowerCase()
    return admins.filter((admin) => (
      (statusFilter === "ALL" || admin.status === statusFilter)
      && (assignmentFilter === "ALL"
        || (assignmentFilter === "ASSIGNED" && admin.shopId)
        || (assignmentFilter === "UNASSIGNED" && !admin.shopId))
      && (!term
        || admin.username?.toLowerCase().includes(term)
        || admin.email?.toLowerCase().includes(term)
        || admin.shopId?.name?.toLowerCase().includes(term)
        || admin.status?.toLowerCase().includes(term))
    ))
  }, [admins, assignmentFilter, search, statusFilter])

  const toggle = async (admin) => {
    const status = admin.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      await adminManagerService.updateAdminStatus(admin._id, status)
      toast.success(t('admin_status_updated'))
      load()
    } catch (error) {
      if (error?.response?.status === 401) return
      toast.error(error.response?.data?.error || t('unable_to_update_admin'))
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
      <PageHeader 
        title={t('admins_management')} 
        description={t('admins_management_desc')}
        action={
          <Link
            className={primaryButtonClass}
            to="/admin-manager/admin-owners/create"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            {t('create_admin')}
          </Link>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-700 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa]">search</span>
            <input
              className={`${inputClass} pl-10`}
              placeholder={t('search_admins_placeholder')}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative min-w-[150px]">
            <select
              className={selectClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">{t('all_statuses')}</option>
              <option value="ACTIVE">{t('active')}</option>
              <option value="INACTIVE">{t('disabled')}</option>
            </select>
          </div>
          <div className="relative min-w-[150px]">
            <select
              className={selectClass}
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
            >
              <option value="ALL">{t('any_assignment')}</option>
              <option value="ASSIGNED">{t('assigned')}</option>
              <option value="UNASSIGNED">{t('unassigned')}</option>
            </select>
          </div>
      </div>

      {/* Data Table Card */}
      <div className={`${cardClass} overflow-hidden flex flex-col`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>{t('admin_name')}</th>
                <th className={tableHeadCellClass}>{t('contact_info')}</th>
                <th className={tableHeadCellClass}>{t('assigned_shop')}</th>
                <th className={`${tableHeadCellClass} text-center`}>{t('status')}</th>
                <th className={`${tableHeadCellClass} text-right`}>{t('last_login')}</th>
                <th className={`${tableHeadCellClass} text-right`}>{t('created_date')}</th>
                <th className={`${tableHeadCellClass} text-right`}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {isLoading ? (
                <TableEmpty colSpan="7">{t('loading_admins')}</TableEmpty>
              ) : displayedAdmins.length === 0 ? (
                <TableEmpty colSpan="7">{t('no_admins_found')}</TableEmpty>
              ) : (
                displayedAdmins.map((admin) => (
                  <tr key={admin._id} className={`group transition-colors ${admin.status === 'INACTIVE' ? 'bg-[#f8fafc] dark:bg-[#09090b]' : 'hover:bg-[#f8fafc] dark:hover:bg-[#09090b]'}`}>
                    <td className={tableCellClass}>
                      <div className={`flex items-center gap-3 ${admin.status === 'INACTIVE' ? 'opacity-60' : ''}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#020617] dark:text-[#f8fafc]">{admin.fullName || admin.username}</p>
                            {admin.role === 'ADMIN_MANAGER' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20 uppercase tracking-wider">{t('manager')}</span>
                            )}
                          </div>
                          {admin.fullName && <p className="text-xs text-[#64748b] dark:text-[#a1a1aa] mt-0.5">@{admin.username}</p>}
                        </div>
                      </div>
                    </td>
                    <td className={tableCellClass}>
                      <div className={admin.status === 'INACTIVE' ? 'opacity-60' : ''}>
                        <p>{admin.email || "-"}</p>
                        <p className="text-xs text-[#64748b] dark:text-[#a1a1aa] mt-0.5">{admin.phone || admin.profile?.phone || admin.contactPhone || admin.ownerPhone || admin.user?.phone || t('no_owner_phone')}</p>
                      </div>
                    </td>
                    <td className={tableCellClass}>
                      <div className={admin.status === 'INACTIVE' ? 'opacity-60' : ''}>
                        <p>{admin.shopId?.name || t('unassigned')}</p>
                      </div>
                    </td>
                    <td className={`${tableCellClass} text-center`}>
                      <StatusBadge status={admin.status} />
                    </td>
                    <td className={`${tableCellClass} text-right`}>
                      <div className={admin.status === 'INACTIVE' ? 'opacity-60' : ''}>
                        {admin.lastLogin ? formatDate(admin.lastLogin, "MMM DD, YYYY HH:mm") : "-"}
                      </div>
                    </td>
                    <td className={`${tableCellClass} text-right`}>
                      <div className={admin.status === 'INACTIVE' ? 'opacity-60' : ''}>
                        {admin.createdAt ? formatDate(admin.createdAt) : "-"}
                      </div>
                    </td>
                    <td className={`${tableCellClass} text-right`}>
                      <div className={`flex items-center justify-end gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity ${admin.status === 'INACTIVE' ? 'opacity-60 hover:opacity-100' : ''}`}>
                        <Link
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 dark:hover:bg-[#06b6d4]/20 transition-colors"
                          title={t('edit_admin')}
                          to={`/admin-manager/admin-owners/${admin._id}/edit`}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${admin.status === 'ACTIVE' ? 'text-[#64748b] dark:text-[#a1a1aa] hover:text-orange-500 hover:bg-orange-500/10' : 'text-[#64748b] dark:text-[#a1a1aa] hover:text-green-500 hover:bg-green-500/10'}`}
                          title={admin.status === 'ACTIVE' ? t('disable_account') : t('enable_account')}
                          onClick={() => toggle(admin)}
                        >
                          <span className="material-symbols-outlined text-[18px]">{admin.status === 'ACTIVE' ? 'block' : 'check_circle'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-[#ffffff] dark:bg-[#111113] border-t border-[#e5e7eb] dark:border-[#27272a] px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-bold text-[#64748b] dark:text-[#a1a1aa]">{t('showing_of_admins', { current: displayedAdmins.length, total: admins.length })}</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-md border border-[#e5e7eb] dark:border-[#27272a] flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] transition-colors disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-md bg-[#06b6d4] text-white flex items-center justify-center text-sm font-bold">1</button>
            <button className="w-8 h-8 rounded-md border border-[#e5e7eb] dark:border-[#27272a] flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] transition-colors text-sm font-bold disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admins
