import { useEffect, useState } from "react"
import { FaListCheck, FaTerminal } from "react-icons/fa6"
import { adminManagerService } from "../../services/adminManager.service"
import formatDate from "../../utils/formatDate"
import {
  cardClass,
  tableCellClass,
  tableHeadCellClass,
  tableHeadClass,
} from "./adminManagerUi"
import { PageHeader, TableEmpty } from "./adminManagerComponents"

function SystemLogs() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    adminManagerService.auditLogs()
      .then((response) => setLogs(response.data.result || []))
  }, [])

  return (
    <section>
      <PageHeader
        title="System Logs"
        description="Review recent platform audit events and administrative actions."
      />

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-gray-500">Audit Events</p>
          <strong className="block text-3xl font-bold text-gray-950">{logs.length.toLocaleString()}</strong>
        </article>
        <article className="rounded-xl border border-gray-950 bg-gray-950 p-5 text-white">
          <div className="flex items-center gap-3">
            <FaTerminal />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.05em] text-gray-300">Log Source</p>
              <p className="mt-1 text-base font-semibold">Admin Manager Audit Log</p>
            </div>
          </div>
        </article>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Date</th>
                <th className={tableHeadCellClass}>User</th>
                <th className={tableHeadCellClass}>Shop</th>
                <th className={tableHeadCellClass}>Action</th>
                <th className={tableHeadCellClass}>Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log._id} className="transition-colors hover:bg-[#f3f4f5]">
                  <td className={tableCellClass}>{formatDate(log.createdAt)}</td>
                  <td className={tableCellClass}>{log.user?.username || "System"}</td>
                  <td className={tableCellClass}>{log.shopId?.name || "Platform"}</td>
                  <td className={tableCellClass}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-[#edeeef] px-3 py-1 text-xs font-bold uppercase tracking-[0.05em] text-gray-700">
                      <FaListCheck />
                      {log.action}
                    </span>
                  </td>
                  <td className={tableCellClass}>{log.entityType}</td>
                </tr>
              ))}
              {logs.length === 0 && <TableEmpty colSpan="5">No audit logs</TableEmpty>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default SystemLogs
