import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { adminManagerService } from "../../../services/adminManager.service"
import { formatApiError } from "../../../utils/formatApiError"
import formatDate from "../../../utils/formatDate"

import { 
  cardClass, 
  inputClass, 
  selectClass, 
  primaryButtonClass,
  tableHeadClass, 
  tableHeadCellClass, 
  tableCellClass 
} from "../adminManagerUi"
import { PageHeader, TableEmpty, StatusBadge } from "../components/AdminManagerUi"


function Admins() {
  const [admins, setAdmins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [assignmentFilter, setAssignmentFilter] = useState("ALL")

  const load = useCallback(() => {
    setIsLoading(true)
    setError("")
    return adminManagerService.getAdmins()
      .then((response) => setAdmins(response.data.result || []))
      .catch((loadError) => {
        if (loadError?.response?.status !== 401) {
          setError(formatApiError(loadError) || "Unable to load admin accounts")
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

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
      toast.success(`Admin ${status.toLowerCase()}`)
      load()
    } catch (error) {
      if (error?.response?.status === 401) return
      toast.error(error.response?.data?.error || "Unable to update admin")
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
      <PageHeader 
        title="Admins Management" 
        description="Manage all admin accounts, roles, and shop assignments."
        action={
          <Link
            className={primaryButtonClass}
            to="/admin-manager/admin-owners/create"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Admin
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
              placeholder="Search by name, email, shop..."
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
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Disabled</option>
            </select>
          </div>
          <div className="relative min-w-[150px]">
            <select
              className={selectClass}
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
            >
              <option value="ALL">Any Assignment</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNASSIGNED">Unassigned</option>
            </select>
          </div>
      </div>

      {/* Data Table Card */}
      <div className={`${cardClass} overflow-hidden flex flex-col`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Admin Name</th>
                <th className={tableHeadCellClass}>Contact Info</th>
                <th className={tableHeadCellClass}>Assigned Shop</th>
                <th className={`${tableHeadCellClass} text-center`}>Status</th>
                <th className={`${tableHeadCellClass} text-right`}>Last Login</th>
                <th className={`${tableHeadCellClass} text-right`}>Created Date</th>
                <th className={`${tableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {isLoading ? (
                <TableEmpty colSpan="7">Loading admins...</TableEmpty>
              ) : displayedAdmins.length === 0 ? (
                <TableEmpty colSpan="7">No admins found matching your criteria.</TableEmpty>
              ) : (
                displayedAdmins.map((admin) => (
                  <tr key={admin._id} className={`group transition-colors ${admin.status === 'INACTIVE' ? 'bg-[#f8fafc] dark:bg-[#09090b]' : 'hover:bg-[#f8fafc] dark:hover:bg-[#09090b]'}`}>
                    <td className={tableCellClass}>
                      <div className={`flex items-center gap-3 ${admin.status === 'INACTIVE' ? 'opacity-60' : ''}`}>
                        <div>
                          <p className="font-bold">{admin.fullName || admin.username}</p>
                          {admin.fullName && <p className="text-xs text-[#64748b] dark:text-[#a1a1aa] mt-0.5">@{admin.username}</p>}
                        </div>
                      </div>
                    </td>
                    <td className={tableCellClass}>
                      <div className={admin.status === 'INACTIVE' ? 'opacity-60' : ''}>
                        <p>{admin.email || "-"}</p>
                        <p className="text-xs text-[#64748b] dark:text-[#a1a1aa] mt-0.5">{admin.phone || admin.profile?.phone || admin.contactPhone || admin.ownerPhone || admin.user?.phone || "No Owner Phone"}</p>
                      </div>
                    </td>
                    <td className={tableCellClass}>
                      <div className={admin.status === 'INACTIVE' ? 'opacity-60' : ''}>
                        <p>{admin.shopId?.name || "Unassigned"}</p>
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
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] hover:text-[#7033ff] hover:bg-[#7033ff]/10 dark:hover:bg-[#7033ff]/20 transition-colors"
                          title="Edit Admin"
                          to={`/admin-manager/admin-owners/${admin._id}/edit`}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${admin.status === 'ACTIVE' ? 'text-[#64748b] dark:text-[#a1a1aa] hover:text-orange-500 hover:bg-orange-500/10' : 'text-[#64748b] dark:text-[#a1a1aa] hover:text-green-500 hover:bg-green-500/10'}`}
                          title={admin.status === 'ACTIVE' ? 'Disable Account' : 'Enable Account'}
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
          <span className="text-sm font-bold text-[#64748b] dark:text-[#a1a1aa]">Showing {displayedAdmins.length} of {admins.length} admins</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-md border border-[#e5e7eb] dark:border-[#27272a] flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] transition-colors disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-md bg-[#7033ff] text-white flex items-center justify-center text-sm font-bold">1</button>
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
