import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { notificationService } from "../../../services/notification.service"
import { adminSurface } from "../adminPageUi"

function NotificationChannels() {
  const [channels, setChannels] = useState([])
  const [chatId, setChatId] = useState("")
  const [enabled, setEnabled] = useState(true)

  const load = () => notificationService.channels()
    .then((response) => {
      const rows = response.data.result || []
      setChannels(rows)
      const telegram = rows.find((channel) => channel.type === "TELEGRAM")
      if (telegram) {
        setChatId(telegram.chatId)
        setEnabled(telegram.enabled)
      }
    })

  useEffect(() => {
    load()
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    try {
      await notificationService.saveChannel({ type: "TELEGRAM", chatId, enabled })
      toast.success("Notification channel saved")
      load()
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to save channel")
    }
  }

  return (
    <section className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>Notifications</p>
          <h1 className={adminSurface.title}>Notification Channels</h1>
          <p className={adminSurface.description}>
            Configure delivery channels used for shop alerts and operational updates.
          </p>
        </div>
      </div>

      <div className={adminSurface.statGrid}>
        {[
          ["Configured", channels.length],
          ["Enabled", channels.filter((channel) => channel?.enabled).length],
          ["Type", "Telegram"],
          ["Current", enabled ? "Enabled" : "Disabled"],
        ].map(([label, value]) => (
          <div key={label} className={adminSurface.statCard}>
            <div className={adminSurface.statIcon}>{String(label).slice(0, 1)}</div>
            <p className={`mt-4 ${adminSurface.statLabel}`}>{label}</p>
            <p className={adminSurface.statValue}>{value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className={`${adminSurface.card} max-w-2xl space-y-5`}>
        <label className="form-control">
          <span className="mb-2 text-sm font-semibold text-[#0b1c30]">Telegram Chat ID</span>
          <input required className={`${adminSurface.input} h-12 w-full`} value={chatId} onChange={(event) => setChatId(event.target.value)} />
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-[#d7dced] bg-[#f8f9ff] px-4 py-3">
          <input className="checkbox checkbox-sm border-[#0058be] checked:border-[#0058be] checked:bg-[#0058be]" type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          <span className="text-sm font-medium text-[#213145]">Enabled</span>
        </label>
        <button className={adminSurface.primaryButton} type="submit">Save</button>
      </form>
    </section>
  )
}

export default NotificationChannels
