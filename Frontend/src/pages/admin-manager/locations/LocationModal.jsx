import { useState, useEffect } from "react"
import { FaXmark } from "react-icons/fa6"
import { locationService } from "../../../services/system/location.service"
import { api } from "../../../utils/config/api"

export default function LocationModal({ isOpen, onClose, onSuccess, initialData }) {
  const [formData, setFormData] = useState({
    province: "",
    district: "",
    commune: "",
    village: "",
    addressDetail: "",
    shop: "",
    status: "ACTIVE"
  })
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      api.get("/admin-manager/shops").then(res => setShops(res.data?.result || []))
      
      if (initialData) {
        setFormData({
          province: initialData.province || "",
          district: initialData.district || "",
          commune: initialData.commune || "",
          village: initialData.village || "",
          addressDetail: initialData.addressDetail || "",
          shop: initialData.shop?._id || initialData.shop || "",
          status: initialData.status || "ACTIVE"
        })
      } else {
        setFormData({
          province: "",
          district: "",
          commune: "",
          village: "",
          addressDetail: "",
          shop: "",
          status: "ACTIVE"
        })
      }
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload = { ...formData }
      if (!payload.shop) delete payload.shop

      if (initialData) {
        await locationService.update(initialData._id, payload)
      } else {
        await locationService.create(payload)
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] text-[#020617] dark:text-[#f8fafc] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] dark:border-[#27272a] px-6 py-4">
          <h2 className="text-lg font-bold">{initialData ? "Edit Location" : "Create Location"}</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-white/5 text-[#64748b] dark:text-[#a1a1aa] transition-colors">
            <FaXmark className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="col-span-2">
              <span className={labelClass}>Province / City</span>
              <input type="text" required className={inputClass} value={formData.province} onChange={e => setFormData({ ...formData, province: e.target.value })} />
            </label>
            <label>
              <span className={labelClass}>District / Khan</span>
              <input type="text" required className={inputClass} value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} />
            </label>
            <label>
              <span className={labelClass}>Commune / Sangkat</span>
              <input type="text" className={inputClass} value={formData.commune} onChange={e => setFormData({ ...formData, commune: e.target.value })} />
            </label>
            <label>
              <span className={labelClass}>Village</span>
              <input type="text" className={inputClass} value={formData.village} onChange={e => setFormData({ ...formData, village: e.target.value })} />
            </label>
            <label>
              <span className={labelClass}>Status</span>
              <select required className={inputClass} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
          </div>

          <label className="mt-4 block">
            <span className={labelClass}>Address Detail</span>
            <textarea className={`${inputClass} min-h-[60px] py-2`} value={formData.addressDetail} onChange={e => setFormData({ ...formData, addressDetail: e.target.value })} />
          </label>

          <label className="mt-4 block">
            <span className={labelClass}>Assigned Shop (Optional)</span>
            <select className={inputClass} value={formData.shop} onChange={e => setFormData({ ...formData, shop: e.target.value })}>
              <option value="">No Shop Assigned</option>
              {shops.map(shop => (
                <option key={shop._id} value={shop._id}>{shop.name} ({shop.code})</option>
              ))}
            </select>
          </label>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-4 py-2 text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-[#7033ff] text-white hover:bg-[#5f27e6] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors">
              {loading ? "Saving..." : "Save Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
