import { useEffect, useState } from "react"
import { notificationService } from "../../../services/notification.service"
import formatDate from "../../../utils/formatDate"
import { adminSurface } from "../adminPageUi"

function NotificationLogs() {
  const [logs, setLogs] = useState([])
  useEffect(() => {
    notificationService.logs()
      .then((response) => setLogs(response.data.result || []))
  }, [])

  return (
    <section className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>Notifications</p>
          <h1 className={adminSurface.title}>Notification Logs</h1>
          <p className={adminSurface.description}>
            Review recent notification delivery events and message outcomes.
          </p>
        </div>
      </div>
      <div className={adminSurface.tableShell}>
        <div className={adminSurface.toolbar}>
          <p className="text-sm font-semibold text-[#0b1c30]">{logs.length} notification log(s)</p>
        </div>
        <div className={adminSurface.tableWrap}>
        <table className={`${adminSurface.table} min-w-[760px]`}>
          <thead className={adminSurface.tableHead}>
            <tr>
              <th className={adminSurface.th}>Date</th>
              <th className={adminSurface.th}>Event</th>
              <th className={adminSurface.th}>Status</th>
              <th className={adminSurface.th}>Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className={adminSurface.row}>
                <td className={`${adminSurface.td} text-[#45464d]`}>{formatDate(log.createdAt)}</td>
                <td className={`${adminSurface.td} font-semibold text-[#0b1c30]`}>{log.eventType}</td>
                <td className={adminSurface.td}>
                  <span className={adminSurface.badge}>{log.status}</span>
                </td>
                <td className={`${adminSurface.td} min-w-80 text-[#45464d]`}>{log.message}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-sm text-[#5b6472]">No notification logs</td></tr>}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  )
}

export default NotificationLogs
