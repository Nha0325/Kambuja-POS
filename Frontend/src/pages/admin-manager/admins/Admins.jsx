import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { FaDownload, FaFilter, FaMagnifyingGlass, FaPlus, FaShop, FaUserShield } from "react-icons/fa6"
import { adminManagerService } from "../../../services/adminManager.service"
import { downloadCsv } from "../../../utils/downloadCsv"
import { formatApiError } from "../../../utils/formatApiError"
import {
  cardClass,
  getInitials,
  primaryButtonClass,
  secondaryButtonClass,
  tableCellClass,
  tableHeadCellClass,
  tableHeadClass,
} from "../adminManagerUi"
import { PageHeader, StatusBadge, TableEmpty } from "../components/AdminManagerUi"

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
    return adminManagerService.admins()
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

  const exportAdmins = () => {
    downloadCsv(
      "admin-manager-admins.csv",
      [
        { label: "Username", value: (admin) => admin.username || "" },
        { label: "Email", value: (admin) => admin.email || "" },
        { label: "Assigned Shop", value: (admin) => admin.shopId?.name || "Platform Wide" },
        { label: "Status", value: (admin) => admin.status || "" },
      ],
      displayedAdmins
    )
  }

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

  const activeCount = admins.filter((admin) => admin.status === "ACTIVE").length
  const assignedCount = admins.filter((admin) => admin.shopId).length

  return (
    <section>
      <PageHeader
        title="Admin Accounts"
        description="Manage platform controller accounts and shop ownership assignments."
        action={(
          <Link className={primaryButtonClass} to="/admin-manager/admins/create">
            <FaPlus />
            Add Admin
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
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Total Admins</p>
          <strong className="block text-3xl font-bold text-slate-900">{admins.length.toLocaleString()}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Active</p>
          <strong className="block text-3xl font-bold text-slate-900">{activeCount.toLocaleString()}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Assigned Shops</p>
          <strong className="block text-3xl font-bold text-slate-900">{assignedCount.toLocaleString()}</strong>
        </article>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-12">
        <label className={`${cardClass} flex h-14 min-w-0 items-center gap-3 px-4 sm:col-span-2 xl:col-span-5`}>
          <FaMagnifyingGlass className="text-slate-500" />
          <input
            className="h-full min-w-0 flex-1 border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
            placeholder="Search by username, email, shop, or status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className={`${secondaryButtonClass} h-14 min-w-0 xl:col-span-2`}>
          <FaFilter />
          <select
            className="min-w-0 bg-transparent text-sm font-semibold outline-none"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
        <label className={`${secondaryButtonClass} h-14 min-w-0 xl:col-span-3`}>
          <FaShop />
          <select
            className="min-w-0 bg-transparent text-sm font-semibold outline-none"
            value={assignmentFilter}
            onChange={(event) => setAssignmentFilter(event.target.value)}
          >
            <option value="ALL">Any Assignment</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>
        </label>
        <button
          className={`${secondaryButtonClass} h-14 min-w-0 sm:col-span-2 xl:col-span-2`}
          type="button"
          onClick={exportAdmins}
          disabled={displayedAdmins.length === 0}
        >
          <FaDownload />
          Export
        </button>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full border-collapse text-left">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Username</th>
                <th className={tableHeadCellClass}>Email</th>
                <th className={tableHeadCellClass}>Assigned Shop</th>
                <th className={tableHeadCellClass}>Status</th>
                <th className={`${tableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100">
              {isLoading ? (
                <TableEmpty colSpan="5">Loading admins...</TableEmpty>
              ) : displayedAdmins.map((admin) => (
                <tr key={admin._id} className="transition-colors hover:bg-violet-50/50">
                  <td className={tableCellClass}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xs font-bold text-violet-800">
                        {getInitials(admin.username)}
                      </div>
                      <span className="font-semibold text-slate-900">{admin.username}</span>
                    </div>
                  </td>
                  <td className={tableCellClass}>{admin.email}</td>
                  <td className={tableCellClass}>
                    <span className="inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-mono text-violet-800">
                      {admin.shopId?.name || "Platform Wide"}
                    </span>
                  </td>
                  <td className={tableCellClass}><StatusBadge status={admin.status} /></td>
                  <td className={`${tableCellClass} text-right`}>
                    <button className={secondaryButtonClass} type="button" onClick={() => toggle(admin)}>
                      <FaUserShield />
                      {admin.status === "ACTIVE" ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && displayedAdmins.length === 0 && <TableEmpty colSpan="5">No admins found</TableEmpty>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Admins
