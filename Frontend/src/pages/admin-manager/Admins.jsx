import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { FaFilter, FaMagnifyingGlass, FaPlus, FaShop, FaUserShield } from "react-icons/fa6"
import { adminManagerService } from "../../services/adminManager.service"
import {
  cardClass,
  getInitials,
  primaryButtonClass,
  secondaryButtonClass,
  tableCellClass,
  tableHeadCellClass,
  tableHeadClass,
} from "./adminManagerUi"
import { PageHeader, StatusBadge, TableEmpty } from "./adminManagerComponents"

function Admins() {
  const [admins, setAdmins] = useState([])
  const [search, setSearch] = useState("")

  const load = () => adminManagerService.admins()
    .then((response) => setAdmins(response.data.result || []))

  useEffect(() => {
    load()
  }, [])

  const displayedAdmins = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return admins
    return admins.filter((admin) => (
      admin.username?.toLowerCase().includes(term)
      || admin.email?.toLowerCase().includes(term)
      || admin.shopId?.name?.toLowerCase().includes(term)
      || admin.status?.toLowerCase().includes(term)
    ))
  }, [admins, search])

  const toggle = async (admin) => {
    const status = admin.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      await adminManagerService.updateAdminStatus(admin._id, status)
      toast.success(`Admin ${status.toLowerCase()}`)
      load()
    } catch (error) {
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

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-gray-500">Total Admins</p>
          <strong className="block text-3xl font-bold text-gray-950">{admins.length.toLocaleString()}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-gray-500">Active</p>
          <strong className="block text-3xl font-bold text-gray-950">{activeCount.toLocaleString()}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-gray-500">Assigned Shops</p>
          <strong className="block text-3xl font-bold text-gray-950">{assignedCount.toLocaleString()}</strong>
        </article>
      </div>

      <div className="mb-6 grid grid-cols-12 gap-4">
        <label className={`${cardClass} col-span-12 flex h-14 items-center gap-3 px-4 md:col-span-6`}>
          <FaMagnifyingGlass className="text-gray-500" />
          <input
            className="h-full min-w-0 flex-1 border-none bg-transparent text-sm text-gray-950 outline-none placeholder:text-gray-400 focus:ring-0"
            placeholder="Search by username, email, shop, or status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <button className={`${secondaryButtonClass} col-span-6 h-14 md:col-span-3`} type="button">
          <FaFilter />
          Status: All
        </button>
        <button className={`${secondaryButtonClass} col-span-6 h-14 md:col-span-3`} type="button">
          <FaShop />
          Assigned Shop: Any
        </button>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Username</th>
                <th className={tableHeadCellClass}>Email</th>
                <th className={tableHeadCellClass}>Assigned Shop</th>
                <th className={tableHeadCellClass}>Status</th>
                <th className={`${tableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedAdmins.map((admin) => (
                <tr key={admin._id} className="transition-colors hover:bg-[#f3f4f5]">
                  <td className={tableCellClass}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edeeef] text-xs font-bold text-gray-950">
                        {getInitials(admin.username)}
                      </div>
                      <span className="font-semibold text-gray-950">{admin.username}</span>
                    </div>
                  </td>
                  <td className={tableCellClass}>{admin.email}</td>
                  <td className={tableCellClass}>
                    <span className="inline-flex rounded-full border border-gray-300 bg-[#edeeef] px-3 py-1 text-xs font-mono text-gray-600">
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
              {displayedAdmins.length === 0 && <TableEmpty colSpan="5">No admins found</TableEmpty>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Admins
