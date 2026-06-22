import { useEffect, useState } from "react"
import { notificationService } from "../../../services/notification.service"
import formatDate from "../../../utils/formatDate"

function NotificationLogs() {
  const [logs, setLogs] = useState([])
  useEffect(() => {
    notificationService.logs()
      .then((response) => setLogs(response.data.result || []))
  }, [])

  return (
    <section>
      <h1 className="text-xl font-semibold">Notification Logs</h1>
      <div className="mt-4 overflow-x-auto border border-gray-200 bg-white">
        <table className="table">
          <thead><tr><th>Date</th><th>Event</th><th>Status</th><th>Message</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{formatDate(log.createdAt)}</td>
                <td>{log.eventType}</td>
                <td>{log.status}</td>
                <td>{log.message}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan="4" className="text-center">No notification logs</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default NotificationLogs
