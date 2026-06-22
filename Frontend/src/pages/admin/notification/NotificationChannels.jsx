import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { notificationService } from "../../../services/notification.service"

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
    <section className="max-w-xl">
      <h1 className="text-xl font-semibold">Notification Channels</h1>
      <form onSubmit={submit} className="mt-4 space-y-4 border border-gray-200 bg-white p-5">
        <label className="form-control">
          <span className="mb-1 text-sm">Telegram Chat ID</span>
          <input required className="input input-bordered" value={chatId} onChange={(event) => setChatId(event.target.value)} />
        </label>
        <label className="flex items-center gap-2">
          <input className="checkbox checkbox-sm" type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          <span className="text-sm">Enabled</span>
        </label>
        <button className="btn btn-sm btn-neutral" type="submit">Save</button>
      </form>
      <p className="mt-3 text-xs text-gray-500">{channels.length} configured channel(s)</p>
    </section>
  )
}

export default NotificationChannels
